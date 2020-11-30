import { MoodleNet } from '../..'
import { getAccountPersistence } from './accounting.env'

MoodleNet.bindApi({
  event: 'Email.Verify_Email.Result',
  api: 'Accounting.Register_New_Account.Email_Confirm_Result',
})

MoodleNet.respondApi({
  api: 'Accounting.Register_New_Account.Email_Confirm_Result',
  async handler({ flow, req }) {
    if (req.success) {
      const confirmResp = await (await getAccountPersistence()).confirmNewAccountRequest({ flow })
      if (confirmResp === 'Request Not Found') {
        return { done: false }
      }
      return { done: true }
    } else {
      await (await getAccountPersistence()).newAccountRequestExpired({ flow })
      return { done: true }
    }
  },
})