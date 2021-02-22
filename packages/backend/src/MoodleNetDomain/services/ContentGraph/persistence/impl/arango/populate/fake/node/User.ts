import fk from 'faker'
import * as GQL from '../../../../../../ContentGraph.graphql.gen'
import { Fake } from '../types'

export const User = (): Fake<GQL.User> => {
  return {
    icon: fk.image.abstract(200, 200),
    name: fk.internet.userName(),
    summary: fk.lorem.paragraphs(3),
  }
}
