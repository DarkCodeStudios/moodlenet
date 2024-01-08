import type { RpcFile } from '@moodlenet/core'
import { defaultImageUploadMaxSize, webImageResizer } from '@moodlenet/react-app/server'
import type {
  AccessEntitiesCustomProject,
  AqlVal,
  EntityAccess,
  GetEntityOpts,
  Patch,
  QueryMyEntitiesOpts,
} from '@moodlenet/system-entities/server'
import {
  create,
  currentEntityVar,
  delEntity,
  entityMeta,
  getCurrentSystemUser,
  getEntity,
  getEntityDoc,
  patchEntity,
  queryMyEntities,
  searchEntities,
  sysEntitiesDB,
  toaql,
} from '@moodlenet/system-entities/server'
import type { CollectionFormProps, SortTypeRpc } from '../common/types.mjs'
import type { ValidationsConfig } from '../common/validationSchema.mjs'
import { getValidationSchemas } from '../common/validationSchema.mjs'
import { canPublish } from './aql.mjs'
import { publicFiles } from './init/fs.mjs'
import { Collection } from './init/sys-entities.mjs'
import { shell } from './shell.mjs'
import type { CollectionDataType } from './types.mjs'

export async function getValidations() {
  const config: ValidationsConfig = {
    imageMaxUploadSize: defaultImageUploadMaxSize,
  }
  const {
    draftCollectionValidationSchema,
    imageValidationSchema,
    publishedCollectionValidationSchema,
  } = getValidationSchemas(config)
  return {
    draftCollectionValidationSchema,
    imageValidationSchema,
    publishedCollectionValidationSchema,
    config,
  }
}

export async function setPublished(key: string, published: boolean) {
  let matchRev: string | undefined = undefined
  if (published) {
    const collection = await shell.call(getEntity)(Collection.entityClass, key)
    if (!collection) {
      return null
    }
    const { publishedCollectionValidationSchema } = await getValidations()
    const collectionFormProps: CollectionFormProps = {
      description: collection.entity.description,
      title: collection.entity.title,
    }
    const isValid = await publishedCollectionValidationSchema.isValid(collectionFormProps)
    if (!isValid) {
      return false
    }
    matchRev = collection.entity._rev
  }
  const patchResult = await shell.call(patchEntity)(
    Collection.entityClass,
    key,
    { published },
    {
      matchRev,
      preAccessBody: published ? `FILTER ${canPublish()}` : undefined,
    },
  )
  if (!patchResult) {
    return
  }
  const collectionDoc = getEntityDoc(patchResult.patched)
  shell.events.emit(published ? 'request-publishing' : 'unpublished', {
    collectionDoc,
    systemUser: await getCurrentSystemUser(),
  })
  if (!published) {
    shell.events.emit('publishing-acceptance', {
      collectionDoc,
      accepted: true,
      automaticAcceptance: true,
    })
  }
  return patchResult
}

export async function patchCollection(
  key: string,
  patch: Patch<Pick<CollectionDataType, 'description' | 'title'>>,
) {
  const collection = await shell.call(getEntity)(Collection.entityClass, key)
  if (!collection) {
    return null
  }
  const { draftCollectionValidationSchema, publishedCollectionValidationSchema } =
    await getValidations()
  const collectionFormProps: CollectionFormProps = {
    description: patch.description ?? collection.entity.description,
    title: patch.title ?? collection.entity.title,
  }
  const isValid = await (collection.entity.published
    ? publishedCollectionValidationSchema
    : draftCollectionValidationSchema
  ).isValid(collectionFormProps)

  if (!isValid) {
    return false
  }

  const patchResult = await shell.call(patchEntity)(
    Collection.entityClass,
    key,
    collectionFormProps,
    {
      postAccessBody: `FILTER !MATCHES( ${currentEntityVar}, ${toaql(collectionFormProps)} )`,
      matchRev: collection.entity._rev,
    },
  )
  if (!patchResult) {
    return
  }

  shell.events.emit('updated', {
    input: { meta: collectionFormProps, image: false },
    collectionDoc: getEntityDoc(patchResult.patched),
    collectionDocOld: getEntityDoc(patchResult.old),
    systemUser: await getCurrentSystemUser(),
  })

  return patchResult
}

export async function createCollection(collectionData: Partial<CollectionDataType>) {
  const newCollection = await shell.call(create)(Collection.entityClass, {
    description: '',
    title: '',
    image: null,
    published: false,
    resourceList: [],
    ...collectionData,
  })
  if (!newCollection) {
    return
  }
  shell.events.emit('created', {
    systemUser: await getCurrentSystemUser(),
    collectionDoc: getEntityDoc(newCollection),
  })
  return newCollection
}

export async function deltaCollectionPopularityItem({
  _key,
  itemName,
  delta,
}: {
  _key: string
  itemName: string
  delta: number
}) {
  const updatePopularityResult = await sysEntitiesDB.query<CollectionDataType>(
    {
      query: `FOR res in @@collections 
      FILTER res._key == @_key
      LIMIT 1
      UPDATE res WITH {
        popularity:{
          overall: res.popularity.overall + ( ${delta} ),
          items:{
            "${itemName}": (res.popularity.items["${itemName}"] || 0) + ( ${delta} )
          }
        }
      } IN @@collections 
      RETURN NEW`,
      bindVars: { '@collections': Collection.collection.name, _key },
    },
    {
      retryOnConflict: 5,
    },
  )
  const updated = await updatePopularityResult.next()
  return updated?.popularity?.overall
}

export async function getMyCollections<
  Project extends AccessEntitiesCustomProject<any>,
  ProjectAccess extends EntityAccess,
>(opts?: QueryMyEntitiesOpts<Project, ProjectAccess>) {
  const collectionsCursor = await shell.call(queryMyEntities)(Collection.entityClass, {
    projectAccess: opts?.projectAccess,
    project: opts?.project,
  })
  return collectionsCursor
}

export async function getCollection<
  Project extends AccessEntitiesCustomProject<any>,
  ProjectAccess extends EntityAccess,
>(_key: string, opts?: GetEntityOpts<Project, ProjectAccess>) {
  const foundCollection = await shell.call(getEntity)(Collection.entityClass, _key, {
    projectAccess: opts?.projectAccess,
    project: opts?.project,
  })
  return foundCollection
}

export async function updateCollectionContent(
  collectionKey: string,
  action: 'add' | 'remove',
  resourceKey: string,
) {
  const aqlResourceListElem: AqlVal<CollectionDataType['resourceList'][number]> = toaql({
    _key: resourceKey,
  })

  const aqlAction =
    action === 'remove'
      ? `REMOVE_VALUE( ${currentEntityVar}.resourceList, ${aqlResourceListElem} , 1 )`
      : `        PUSH( ${currentEntityVar}.resourceList, ${aqlResourceListElem} , true )`
  const updateResult = await shell.call(patchEntity)(
    Collection.entityClass,
    collectionKey,
    `{ 
      resourceList: ${aqlAction}
    }`,
  )
  if (!updateResult) {
    return
  }
  shell.events.emit('resource-list-curation', {
    collectionDoc: getEntityDoc(updateResult.patched),
    action,
    resourceKey,
    systemUser: await getCurrentSystemUser(),
  })
  return updateResult
}

export async function delCollection(_key: string) {
  const delResult = await shell.call(delEntity)(Collection.entityClass, _key)
  if (!delResult) {
    return
  }
  shell.events.emit('deleted', {
    collectionDoc: delResult.entity,
    systemUser: await getCurrentSystemUser(),
  })
  return delResult
}

export function getImageLogicalFilename(collectionKey: string) {
  return `image/${collectionKey}`
}

export async function setCollectionImage(
  _key: string,
  image: RpcFile | null | undefined,
  opts?: {
    noResize?: boolean
  },
) {
  const imageLogicalFilename = getImageLogicalFilename(_key)
  const imageProp = !image
    ? null
    : await (async () => {
        const resizedRpcFile = opts?.noResize ? image : await webImageResizer(image, 'image')

        const { directAccessId } = await publicFiles.store(imageLogicalFilename, resizedRpcFile)

        const imageProp = { kind: 'file', directAccessId } as const
        return imageProp
      })()

  const patchResult = await shell.call(patchEntity)(Collection.entityClass, _key, {
    image: imageProp,
  })
  if (!imageProp || !patchResult) {
    await publicFiles.del(imageLogicalFilename)
    if (!patchResult) {
      return patchResult
    }
  }

  shell.events.emit('updated', {
    input: { image: true },
    collectionDoc: getEntityDoc(patchResult.patched),
    collectionDocOld: getEntityDoc(patchResult.old),
    systemUser: await getCurrentSystemUser(),
  })
  return patchResult
}

export async function searchCollections({
  limit = 20,
  sortType = 'Recent',
  text = '',
  after = '0',
}: {
  sortType?: SortTypeRpc
  text?: string
  after?: string
  limit?: number
}) {
  const sort =
    sortType === 'Popular'
      ? `${currentEntityVar}.popularity.overall DESC, rank DESC`
      : sortType === 'Relevant'
      ? 'rank DESC'
      : sortType === 'Recent'
      ? `${entityMeta(currentEntityVar, 'created')} DESC`
      : 'rank DESC'
  const skip = Number(after)
  const cursor = await shell.call(searchEntities)(
    Collection.entityClass,
    text,
    [{ name: 'title', factor: 5 }, { name: 'description' }],
    {
      limit,
      skip,
      sort,
    },
  )

  const list = await cursor.all()
  return {
    list,
    endCursor: list.length < limit ? undefined : String(skip + list.length),
  }
}
