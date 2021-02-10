import { ContentGraphPersistence } from '../../types'
import { createEdge } from './apis/createEdge'
import { createNode } from './apis/createNode'
import { createUser } from './apis/createUser'
import { findNode, findNodeWithPolicy } from './apis/findNode'
import { traverseEdges } from './apis/traverseEdges'
// import { getGraphQLTypeResolvers } from './graphqlTypeResolvers'

export const getArangoContentGraphPersistence = (): ContentGraphPersistence => {
  const persistence: ContentGraphPersistence = {
    findNode,
    findNodeWithPolicy,
    createUser,
    traverseEdges,
    createNode,
    createEdge,
    // graphQLTypeResolvers: getGraphQLTypeResolvers(),
  }
  return persistence
}