import { plugin, registerOpenGraphProvider } from '@moodlenet/react-app/server'
import type { MyWebDeps } from '../../common/types.mjs'
import { matchCollectionHomePageRoutePathKey } from '../../common/webapp-routes.mjs'
import { expose as me } from '../expose.mjs'
import { getCollection } from '../lib.mjs'
import { shell } from '../shell.mjs'
import { publicFilesHttp } from './fs.mjs'

shell.call(plugin)<MyWebDeps>({
  initModuleLoc: ['dist', 'webapp', 'exports', 'init.mjs'],
  deps: { me },
})

shell.call(registerOpenGraphProvider)({
  async provider(webappPath) {
    const key = matchCollectionHomePageRoutePathKey(webappPath)
    if (!key) {
      return
    }
    const collectionRecord = await getCollection(key)
    if (!collectionRecord) {
      return
    }
    const image = collectionRecord.entity.image
      ? publicFilesHttp.getFileUrl({ directAccessId: collectionRecord.entity.image.directAccessId })
      : ''
    return {
      description: collectionRecord.entity.description,
      image: image,
      title: collectionRecord.entity.title,
    }
  },
})