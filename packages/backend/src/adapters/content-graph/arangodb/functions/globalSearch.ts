import * as GQL from '@moodlenet/common/lib/graphql/types.graphql.gen'
import { Document } from 'arangojs/documents'
import { Maybe } from 'graphql/jsutils/Maybe'
import { aqlstr } from '../../../../lib/helpers/arango'
import { isMarkDeleted, makePage, skipLimitPagination, toDocumentEdgeOrNode } from './helpers'

export const globalSearchQuery = ({
  page,
  text,
  nodeTypes,
  sortBy = 'Relevance',
}: {
  text: string
  page: Maybe<GQL.PaginationInput>
  nodeTypes: Maybe<GQL.NodeType[]>
  sortBy: Maybe<GQL.GlobalSearchSort>
}) => {
  const { limit, skip } = skipLimitPagination({ page })
  const aql_txt = aqlstr(text)

  const nodeTypeConditions = (nodeTypes ?? []).map(nodeType => `node.__typename == ${aqlstr(nodeType)}`).join(' OR ')

  const filterConditions = [nodeTypeConditions].filter(Boolean).join(' && ')

  const sortFactor =
    sortBy === 'Relevance'
      ? '1'
      : '(1 + (node._relCount.Likes.from.Profile || 0) + (node._relCount.Follows.from.Profile || 0))'

  const query = `
      FOR node IN SearchView
        SEARCH ANALYZER(
          BOOST( PHRASE(node.name, ${aql_txt}), 10 )
          OR
          BOOST( PHRASE(node.description, ${aql_txt}), 5 )
          OR
          BOOST( node.name IN TOKENS(${aql_txt}), 3 )
          OR
          BOOST( node.summary IN TOKENS(${aql_txt}), 1 )
          OR
          BOOST(  NGRAM_MATCH(node.name, ${aql_txt}, 0.05, "global-search-ngram"), 0.2 )
          OR
          BOOST( NGRAM_MATCH(node.summary, ${aql_txt}, 0.05, "global-search-ngram"), 0.1 )
        , "text_en")
      
        FILTER !${isMarkDeleted('node')} AND ${filterConditions || 'true'}

      SORT ( TFIDF(node) * ${sortFactor}) desc, node._key 
      
      LIMIT ${skip}, ${limit}
      
      RETURN {
        node: ${toDocumentEdgeOrNode('node')}
      }
    `
  return { limit, skip, query }
}

export const makeGlobalSearchGQLSearchPage = ({
  documents,
  skip,
}: {
  documents: Document[]
  skip: number
}): GQL.SearchPage => {
  const results = documents.map((edge, i) => {
    return {
      ...edge,
      cursor: i + skip,
    }
  })

  return makePage<GQL.SearchPage>({
    afterEdges: results,
    beforeEdges: [],
    pageEdgeTypename: 'SearchPageEdge',
    pageTypename: 'SearchPage',
  })
}