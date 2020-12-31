import { graphql } from 'graphql'
import { MoodleNet } from '../../..'
import { schema } from '../graphql/schema'

MoodleNet.respondApi({
  api: 'UserAccount.GQL',
  async handler({ req: { context, query, variables } }) {
    console.log('ContentGraph.GQL req', { context, query, variables })
    const resp = await graphql(
      schema,
      query,
      {}, //rootValue
      context,
      variables
    )
    console.log('ContentGraph.GQL resp', resp)
    return {
      data: resp.data,
      errors: resp.errors,
      extensions: resp.extensions,
    }
  },
})