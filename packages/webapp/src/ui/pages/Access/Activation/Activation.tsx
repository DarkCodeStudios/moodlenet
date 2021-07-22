import { t, Trans } from '@lingui/macro'
import Card from '../../../components/atoms/Card/Card'
import PrimaryButton from '../../../components/atoms/PrimaryButton/PrimaryButton'
import { withCtrl } from '../../../lib/ctrl'
import { SubmitForm, useFormikBag } from '../../../lib/formik'
import { MainPageWrapper } from '../../../templates/page/MainPageWrapper'
import AccessHeader, { AccessHeaderProps } from '../AccessHeader/AccessHeader'
import './styles.scss'

export type ActivationFormValues = { username: string, password: string }
export type ActivationProps = {
  accessHeaderProps: AccessHeaderProps
  onSubmit: SubmitForm<ActivationFormValues>
  activationErrorMessage: string | null
  requestSent: boolean
}

export const Activation = withCtrl<ActivationProps>(({ accessHeaderProps, onSubmit, requestSent }) => {
  const [form, attrs] = useFormikBag({ initialValues: { username: '', password: '' }, onSubmit })
  return (
    <MainPageWrapper>
      <div className="activation-page" >
        <AccessHeader {...accessHeaderProps} page={'activation'} />
        <div className="separator" />
        <div className="main-content">
          <Card><Trans>Account activated!</Trans></Card>
          <Card>
            <div className="content">
              <div className="title">
                <Trans>User details</Trans>
              </div>
              <form>
                <input
                  className="username"
                  type="text"
                  placeholder={t`Username`}
                  {...attrs.username}
                  onChange={form.handleChange}
                />
                <input
                  className="password"
                  type="password"
                  placeholder={t`Password`}
                  {...attrs.password}
                  onChange={form.handleChange}
                />
              </form>
              <div className="bottom">
                <div className="left">
                  <PrimaryButton onClick={form.submitForm}>
                    <Trans>Finish</Trans>
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainPageWrapper>
  )
})
Activation.displayName = 'SignUpPage'
