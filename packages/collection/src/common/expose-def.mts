import { PkgExposeDef, RpcFile } from '@moodlenet/core'
import { CollectionFormRpc, CollectionRpc } from './types.mjs'

export type CollectionExposeType = PkgExposeDef<{
  rpc: {
    'webapp/set-is-published/:_key'(
      body: { publish: boolean },
      params: { _key: string },
    ): Promise<void>
    'webapp/get/:_key'(body: null, params: { _key: string }): Promise<CollectionRpc | undefined>
    'webapp/edit/:_key'(
      body: { values: CollectionFormRpc },
      params: { _key: string },
    ): Promise<void>
    'webapp/create'(): Promise<{ _key: string }>
    'webapp/delete/:_key'(body: null, params: { _key: string }): Promise<void>
    'webapp/upload-image/:_key'(
      body: { file: [RpcFile] },
      params: { _key: string },
    ): Promise<string>
  }
}>