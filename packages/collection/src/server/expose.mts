import { shell } from './shell.mjs'

import { RpcStatus } from '@moodlenet/core'
import { getWebappUrl, webImageResizer } from '@moodlenet/react-app/server'
import {
  AccessEntitiesRecordType,
  AqlVal,
  creatorUserInfoAqlProvider,
  EntityInfo,
  getCurrentUserInfo,
  isCurrentUserCreatorOfCurrentEntity,
} from '@moodlenet/system-entities/server'
import { CollectionExposeType } from '../common/expose-def.mjs'
import { CollectionContributorRpc, CollectionRpc } from '../common/types.mjs'
import { getCollectionHomePageRoutePath } from '../common/webapp-routes.mjs'
import { canPublish } from './aql.mjs'
import { publicFiles, publicFilesHttp } from './init.mjs'
import {
  createCollection,
  delCollection,
  getCollection,
  getImageLogicalFilename,
  getMyCollections,
  patchCollection,
  updateCollectionContent,
} from './lib.mjs'
import { CollectionDataType } from './types.mjs'

export const expose = await shell.expose<CollectionExposeType>({
  rpc: {
    'webapp/get-mine': {
      guard: () => void 0,
      async fn() {
        const meEntityInfo = await getCurrentUserInfo()
        const contributor = getRpcContributor(meEntityInfo)
        const myCollectionsCursor = await getMyCollections({
          projectAccess: ['u', 'd'],
          project: {
            canPublish: canPublish(),
            isCreator: isCurrentUserCreatorOfCurrentEntity(),
          },
        })
        const myCollectionsDocs = await myCollectionsCursor.all()
        const collections = myCollectionsDocs.map(_ => {
          const collectionRpc = getCollectionRpc(_)
          return collectionRpc
        })

        return {
          collections,
          contributor,
        }
      },
    },
    'webapp/content/:collectionKey/:action/:resourceKey': {
      guard: () => void 0,
      async fn(_, { action, collectionKey, resourceKey }) {
        const updateResult = await updateCollectionContent(collectionKey, action, resourceKey)
        if (!updateResult) {
          return //throw ?
        }
        return
      },
    },
    'webapp/set-is-published/:_key': {
      guard: () => void 0,
      async fn({ publish }, { _key }) {
        const patchResult = await patchCollection(_key, { published: publish })
        if (!patchResult) {
          return //throw ?
        }
        return
      },
    },
    'webapp/get/:_key': {
      guard: () => void 0,
      async fn(_, { _key }) {
        const found = await getCollection(_key, {
          projectAccess: ['u', 'd'],
          project: {
            canPublish: canPublish(),
            isCreator: isCurrentUserCreatorOfCurrentEntity(),
            contributor: creatorUserInfoAqlProvider(),
          },
        })
        if (!found) {
          return
        }

        const contributor: CollectionContributorRpc = getRpcContributor(found.contributor)
        const collectionRpcNoContrib = getCollectionRpc(found)
        const collectionRpc: CollectionRpc = {
          contributor,
          ...collectionRpcNoContrib,
        }
        return collectionRpc
      },
    },
    'webapp/edit/:_key': {
      guard: () => void 0,
      async fn({ values }, { _key }) {
        const patchResult = await patchCollection(_key, values)
        if (!patchResult) {
          return
        }
        return
      },
    },
    'webapp/create': {
      guard: () => void 0,
      async fn() {
        const createResult = await createCollection({
          description: '',
          title: '',
          image: null,
          published: false,
          resourceList: [],
        })
        if (!createResult) {
          throw RpcStatus('Unauthorized')
        }
        return {
          _key: createResult._key,
        }
      },
    },
    'webapp/delete/:_key': {
      guard: () => void 0,
      async fn(_, { _key }) {
        const delResult = await delCollection(_key)
        if (!delResult) {
          return
        }
        const imageLogicalFilename = getImageLogicalFilename(_key)
        await publicFiles.del(imageLogicalFilename)

        return
      },
    },
    'webapp/upload-image/:_key': {
      guard: () => void 0,
      async fn({ file: [uploadedRpcFile] }, { _key }) {
        const got = await getCollection(_key, { projectAccess: ['u'] })

        if (!got?.access.u) {
          throw RpcStatus('Unauthorized')
        }
        const imageLogicalFilename = getImageLogicalFilename(_key)

        const resizedRpcFile = await webImageResizer(uploadedRpcFile, 'image')

        const { directAccessId } = await publicFiles.store(imageLogicalFilename, resizedRpcFile)

        await patchCollection(_key, {
          image: { kind: 'file', directAccessId },
        })
        return publicFilesHttp.getFileUrl({ directAccessId })
      },
      bodyWithFiles: {
        fields: {
          '.file': 1,
        },
      },
    },
  },
})
function getCollectionRpc(
  found: AccessEntitiesRecordType<
    CollectionDataType,
    {
      canPublish: AqlVal<boolean>
      isCreator: AqlVal<boolean>
    },
    'u' | 'd'
  >,
) {
  const imageUrl = found.entity.image
    ? publicFilesHttp.getFileUrl({ directAccessId: found.entity.image.directAccessId })
    : ''
  const _key = found.entity._key
  const collectionRpc: Omit<CollectionRpc, 'contributor'> = {
    form: { description: found.entity.description, title: found.entity.title },
    data: {
      collectionId: found.entity._key,
      mnUrl: getWebappUrl(getCollectionHomePageRoutePath({ _key })),
      imageUrl,
      isWaitingForApproval: false,
    },
    state: {
      numResources: found.entity.resourceList.length,
      isPublished: found.entity.published,
    },
    access: {
      canDelete: !!found.access.d,
      canEdit: !!found.access.u,
      canPublish: found.canPublish,
      isCreator: found.isCreator,
    },
  }
  return collectionRpc
}

function getRpcContributor(contributor: EntityInfo): CollectionContributorRpc {
  return {
    avatarUrl: contributor.iconUrl,
    creatorProfileHref: {
      url: contributor.homepagePath,
      ext: false,
    },
    displayName: contributor.name,
  }
}
