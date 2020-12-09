import { Flow } from '../../../../lib/domain/types/path'
import { CreatedDocumentBase, Maybe, MutableDocumentBase } from '../../../../lib/helpers/types'
import { AccountRequest, ChangeAccountEmailRequest } from '../Accounting'

type AccountKey = string
export interface AccountingPersistence {
  getAccountByUsername(_: { username: string }): Promise<Maybe<AccountDocument>>
  isUserNameAvailable(_: { username: string }): Promise<boolean>
  newAccountRequestExpired(_: { flow: Flow }): Promise<Maybe<NewAccountRequestDocument>>
  addNewAccountRequest(_: {
    req: AccountRequest
    flow: Flow
  }): Promise<true | 'account or request with this email already present'>
  addChangeAccountEmailRequest(_: {
    req: ChangeAccountEmailRequest
    flow: Flow
  }): Promise<true | 'account or request with this email already present'>
  confirmAccountEmailChangeRequest(_: {
    flow: Flow
  }): Promise<'Confirmed' | 'Request Not Found' | 'Previously Confirmed'>
  changeAccountEmailRequestExpired(_: {
    flow: Flow
  }): Promise<Maybe<ChangeAccountEmailRequestDocument>>
  confirmNewAccountRequest(_: {
    flow: Flow
  }): Promise<'Confirmed' | 'Request Not Found' | 'Previously Confirmed'>
  activateNewAccount(_: {
    requestFlowKey: string
    password: string
    username: string
  }): Promise<
    | AccountDocument
    | 'Request Not Found'
    | 'Unconfirmed Request'
    | 'Username Not Available'
    | 'Account Already Created'
  >
  config(): Promise<Config>
}

// ^ AccountDocument
type AccountDocument = {
  email: string
  password: string
  username: string
  active: boolean
  requestFlowKey: string // TODO: remove this. may use some incoming edge instead
} & MutableDocumentBase
// $ AccountDocument

// ^ NewAccountRequestDocument
type NewAccountRequestDocumentStatus =
  | 'Waiting Email Confirmation'
  | 'Email Confirmed'
  | 'Account Created'
  | 'Confirm Expired'
type NewAccountRequestDocument = {
  email: string
  status: NewAccountRequestDocumentStatus
} & Flow & // TODO: would it make sense to use incoming edge for flow relation too (all around ) ?
  MutableDocumentBase
// $ NewAccountRequestDocument

// ^ ChangeAccountEmailRequestDocument
type ChangeAccountEmailRequestDocumentStatus =
  | 'Waiting Email Confirmation'
  | 'Email Confirmed'
  | 'Confirm Expired'
type ChangeAccountEmailRequestDocument = {
  newEmail: string
  username: string
  status: ChangeAccountEmailRequestDocumentStatus
} & Flow &
  MutableDocumentBase
// $ ChangeAccountEmailRequestDocument

// ^ Config
type Config = {
  sendEmailConfirmationAttempts: number
  sendEmailConfirmationDelay: number
  newAccountRequestEmail: {
    text: string
    subject: string
    from: string
  }
  changeAccountEmailRequestEmail: {
    text: string
    subject: string
    from: string
  }
} & CreatedDocumentBase
// $ Config
