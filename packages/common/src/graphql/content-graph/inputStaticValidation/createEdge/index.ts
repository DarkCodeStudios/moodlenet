import { object, ObjectSchema, ValidationError } from 'yup'
import { CreateEdgeInput, EdgeType } from '../../../types.graphql.gen'
import { neverCreate } from '../helpers'

type Just<T> = Exclude<T, null | undefined>
const inputObjectValidators: {
  [T in EdgeType]: ObjectSchema<Just<CreateEdgeInput[T]>>
} = {
  Follows: object<Just<CreateEdgeInput['Follows']>>().required(),
  Created: neverCreate('Created'),
  AppliesTo: object<Just<CreateEdgeInput['AppliesTo']>>().required(),
  Contains: object<Just<CreateEdgeInput['Contains']>>().required(),
  Likes: object<Just<CreateEdgeInput['Likes']>>().required(),
  Edited: object<Just<CreateEdgeInput['Edited']>>().required(),
}

export const validateCreateEdgeInput = (input: CreateEdgeInput): Just<CreateEdgeInput[EdgeType]> | Error => {
  const { edgeType } = input
  if (!(edgeType in input)) {
    return new Error(`wants to create ${edgeType} but no data provided in ${edgeType} prop`)
  }
  const validator = inputObjectValidators[edgeType]
  try {
    return validator.validateSync(input[edgeType])
  } catch (err) {
    return err as ValidationError
  }
}