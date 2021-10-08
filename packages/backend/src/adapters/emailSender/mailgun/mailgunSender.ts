import createMailgun from 'mailgun-js'
import { SockOf } from '../../../lib/stub/Stub'
import { sendEmailAdapter } from '../../../ports/user-auth/adapters'
// import { EmailSender } from '../types'

export const getMailgunSendEmailAdapter = (cfg: createMailgun.ConstructorParams): SockOf<typeof sendEmailAdapter> => {
  const mailgun = createMailgun(cfg)

  return req =>
    mailgun
      .messages()
      .send(req)
      .then(resp => ({ success: true, emailId: resp.id } as const))
      .catch(err => ({ success: false, error: String(err) } as const))
}
