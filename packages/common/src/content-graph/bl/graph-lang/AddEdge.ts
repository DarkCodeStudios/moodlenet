import { Assumptions, BaseOperators, BV } from '.'
import { EdgeType, NodeType } from '../../../graphql/types.graphql.gen'
import { SessionEnv } from '../../../types'
import { GraphNode, GraphNodeIdentifier } from '../../types/node'
import { GraphOperators } from './graphOperators'

export type AddEdgeOperators = {
  issuerNode: BV<GraphNode | null>
  fromNode: BV<GraphNode | null>
  toNode: BV<GraphNode | null>
}
export type AddEdgeAssumptionsFactory = (_: {
  from: GraphNodeIdentifier
  to: GraphNodeIdentifier
  env: SessionEnv
  graphOperators: GraphOperators
  baseOperators: BaseOperators
  addEdgeOperators: AddEdgeOperators
}) => Promise<Assumptions>

export type AddEdgeAssumptionsFactoryMap = Partial<
  Record<`${NodeType}_${EdgeType}_${NodeType}`, AddEdgeAssumptionsFactory>
>

export const getAddEdgeAssumptions = async ({
  edgeType,
  env,
  from,
  map,
  to,
  graphOperators,
  baseOperators,
  addEdgeOperators,
}: {
  from: GraphNodeIdentifier
  edgeType: EdgeType
  to: GraphNodeIdentifier
  env: SessionEnv
  map: AddEdgeAssumptionsFactoryMap
  graphOperators: GraphOperators
  baseOperators: BaseOperators
  addEdgeOperators: AddEdgeOperators
}) => {
  const assuptionsFactory = map[`${from._type}_${edgeType}_${to._type}`]
  if (!assuptionsFactory) {
    return undefined
  }
  return assuptionsFactory({ env, from, to, graphOperators, baseOperators, addEdgeOperators })
}

// declare const graph: GraphOperators
// declare const base: BaseOperators
// declare const e: Exec
// ;(async () => {
//   const val = base.cmp(5, '!=', 7)
//   const x = await e(val)
//   console.log(x)
// })()
// ;(async () => {
//   const val = base.cond(true, 'a' as const, 'b' as const)
//   const x = await e(val)
//   console.log(x)
// })()
// ;(async () => {
//   const isc = graph.isCreator({ _type: 'Collection', _permId: '' }, { _type: 'Collection', _permId: '' })
//   const _or = base.or(isc, isc, isc, true)
//   const val = graph.isCreator(
//     base.cond(isc, { _type: 'Collection', _permId: '' }, { _type: 'Collection', _permId: '' }),
//     { _type: 'Collection', _permId: '' },
//   )
//   const x = await e(val)
//   console.log(x, _or)
// })()
// ;(async () => {
//   const isc = graph.isCreator({ _type: 'Collection', _permId: '' }, { _type: 'Collection', _permId: '' })
//   const val = base.cond(isc, isc, 'b' as const)
//   const x = await e(val)
//   console.log(x)
// })()
