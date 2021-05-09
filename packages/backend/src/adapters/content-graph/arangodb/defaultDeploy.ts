import { Id, parseNodeId } from '@moodlenet/common/lib/utils/content-graph'
import { Config } from 'arangojs/connection'
import { emit } from '../../../../../lib/domain/amqp/emit'
import { enqueue } from '../../../../../lib/domain/amqp/enqueue'
import { mergeFlow } from '../../../../../lib/domain/flow'
import { Acks } from '../../../../../lib/domain/misc'
import { DomainSetup, DomainStart } from '../../../../../lib/domain/types'
import { getSessionContext, getSystemExecutionContext, initMoodleNetGQLWrkService } from '../../../../graphql'
import { getPersistence } from './db/maintainance/persistence'
import { getContentGraphResolvers } from './graphql.resolvers'
import { createEdge } from './lib/createEdge'
import { createNode } from './lib/createNode'
import { deleteEdge } from './lib/deleteEdge'
import { getNode } from './lib/getNode'
import { globalSearch } from './lib/globalSearch'
import { traverseEdges } from './lib/traverseEdges'
import { updateNodeEdgeCounters } from './lib/updateNode-EdgeCounters'
import { MoodleNetArangoContentGraphSubDomain } from './MoodleNetArangoContentGraphSubDomain'

export const defaultArangoContentGraphSetup: DomainSetup<MoodleNetArangoContentGraphSubDomain> = {
  'ContentGraph.Node.ById': { kind: 'wrk' },
  'ContentGraph.Edge.Create': { kind: 'wrk' },
  'ContentGraph.Edge.Delete': { kind: 'wrk' },
  'ContentGraph.Node.Create': { kind: 'wrk' },
  'ContentGraph.GQL': { kind: 'wrk' },
  'ContentGraph.Stats.MaintainEdgeCounters.Created': {
    kind: 'sub',
    event: 'ContentGraph.Edge.Created',
  },
  'ContentGraph.Stats.MaintainEdgeCounters.Deleted': {
    kind: 'sub',
    event: 'ContentGraph.Edge.Deleted',
  },
  'ContentGraph.CreateProfileForNewUser': { kind: 'wrk' },
  'ContentGraph.Edge.Traverse': { kind: 'wrk' },
  'ContentGraph.GetUserProfile': { kind: 'wrk' },
  'ContentGraph.GlobalSearch': { kind: 'wrk', cfg: { parallelism: 50 } },
}

export const defaultArangoContentGraphStartServices = ({
  dbCfg,
  databaseName,
}: {
  dbCfg: Config
  databaseName: string
}) => {
  const _getPersistence = () => getPersistence({ cfg: dbCfg, databaseName })
  const moodleNetArangoContentGraphSubDomainStart: DomainStart<MoodleNetArangoContentGraphSubDomain> = {
    'ContentGraph.Stats.MaintainEdgeCounters.Created': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ edge }) => {
            // console.log({ edge })
            await updateNodeEdgeCounters({ edgeId: edge._id as Id, persistence, del: false })
            return Acks.Done
          },
          teardown,
        ]
      },
    },

    'ContentGraph.Stats.MaintainEdgeCounters.Deleted': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ edge }) => {
            // console.log({ edge })
            await updateNodeEdgeCounters({ edgeId: edge._id as Id, persistence, del: true })
            return Acks.Done
          },
          teardown,
        ]
      },
    },

    'ContentGraph.Edge.Create': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ ctx, data, edgeType, from, to, key }) => {
            const { profileId: creatorProfileId } = getSessionContext(ctx)
            const mEdge = await createEdge({ ctx, data, edgeType, from, persistence, to, key })
            if (typeof mEdge === 'string') {
              return mEdge === 'no assertions found' ? 'UnexpectedInput' : 'NotAuthorized'
            }
            if ('CreateEdgeAssertionsFailed' in mEdge) {
              return 'AssertionFailed'
            }
            // console.log(`emit create edge`, mEdge.id)

            emit<MoodleNetArangoContentGraphSubDomain>()(
              'ContentGraph.Edge.Created',
              { edge: mEdge, creatorProfileId },
              mergeFlow(ctx.flow, [edgeType]),
            )

            return mEdge
          },
          teardown,
        ]
      },
    },

    'ContentGraph.Node.Create': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ ctx, data, nodeType, key }) => {
            const { profileId: creatorProfileId } = getSessionContext(ctx)

            // * maybe context should not get here,
            // * maybe this level should not be aware of context
            // * and here we get relevant data (creatorProfileId, role, username)
            // * here we trust Adapters (http or other) that extracts relevant args
            // * to be passed here

            //TODO: Assertion should be retrieved here
            // check context assertion here,and forward the adeqate Assertion to createNodev
            //TODO: also, ctx should not leak down to adapter
            // there's `creatorProfileId` to pass down
            const mNode = await createNode({
              data,
              nodeType,
              persistence,
              key,
              ctx,
            })

            if (typeof mNode === 'string') {
              return mNode === 'no assertions found' ? 'UnexpectedInput' : 'NotAuthorized'
            }
            if ('CreateNodeAssertionsFailed' in mNode) {
              return 'AssertionFailed'
            }

            emit<MoodleNetArangoContentGraphSubDomain>()(
              `ContentGraph.Node.Created`,
              { node: mNode, creatorProfileId },
              mergeFlow(ctx.flow, [nodeType]),
            )
            enqueue<MoodleNetArangoContentGraphSubDomain>()(`ContentGraph.Edge.Create`, ctx.flow)({
              ctx,
              data: {},
              edgeType: 'Created',
              from: creatorProfileId,
              to: mNode._id,
            })

            return mNode
          },
          teardown,
        ]
      },
    },

    'ContentGraph.Edge.Delete': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ ctx, edgeId, edgeType }) => {
            type E = typeof edgeType
            const { profileId: deleterProfileId } = getSessionContext(ctx)
            const delEdgeResult = await deleteEdge<E>({ ctx, edgeId, edgeType, persistence })
            if (typeof delEdgeResult === 'string') {
              return delEdgeResult === 'no assertions found'
                ? 'UnexpectedInput'
                : delEdgeResult === 'edge not found'
                ? 'NotFound'
                : 'NotAuthorized'
            }

            if ('DeleteEdgeAssertionsFailed' in delEdgeResult) {
              return 'AssertionFailed'
            }
            // console.log(`emit delete edge`, delEdgeResult.id)
            emit<MoodleNetArangoContentGraphSubDomain>()(
              'ContentGraph.Edge.Deleted',
              { edge: delEdgeResult, deleterProfileId },
              mergeFlow(ctx.flow, [edgeType]),
            )
            return delEdgeResult
          },
          teardown,
        ]
      },
    },

    'ContentGraph.Node.ById': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [({ ctx, _key, nodeType }) => getNode({ _key, ctx, nodeType, persistence }), teardown]
      },
    },

    'ContentGraph.Edge.Traverse': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          ({ edgeType, page, parentNodeId, inverse, targetNodeType, targetNodeIds, ctx }) =>
            traverseEdges({ ctx, targetNodeIds, edgeType, inverse, page, parentNodeId, persistence, targetNodeType }),
          teardown,
        ]
      },
    },

    'ContentGraph.CreateProfileForNewUser': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ username, key }) => {
            const createResult = await createNode({
              data: { name: username, summary: '' },
              nodeType: 'Profile',
              persistence,
              key,
              ctx: getSystemExecutionContext({}),
            })
            if (typeof createResult === 'string') {
              throw new Error(createResult)
            }
            if ('CreateNodeAssertionsFailed' in createResult) {
              throw new Error('CreateNodeAssertionsFailed')
            }

            return createResult
          },
          teardown,
        ]
      },
    },

    'ContentGraph.GetUserProfile': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          async ({ profileId }) => {
            const { _key, nodeType } = parseNodeId(profileId)

            if (nodeType !== 'Profile') {
              return null
            }
            return getNode<'Profile'>({ _key, nodeType: 'Profile', persistence, ctx: getSystemExecutionContext({}) })
          },
          teardown,
        ]
      },
    },

    'ContentGraph.GlobalSearch': {
      init: async () => {
        const [persistence, teardown] = await _getPersistence()
        return [
          ({ page, text, nodeTypes, sortBy }) => globalSearch({ page, persistence, text, nodeTypes, sortBy }),
          teardown,
        ]
      },
    },

    'ContentGraph.GQL': {
      init: initMoodleNetGQLWrkService({
        srvName: 'ContentGraph',
        executableSchemaDef: { resolvers: getContentGraphResolvers() },
      }),
    },
  }
  return moodleNetArangoContentGraphSubDomainStart
}
