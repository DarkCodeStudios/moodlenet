import { t, Trans } from '@lingui/macro'
import { FC } from 'react'
import { Form } from 'semantic-ui-react'
import { FormBag } from '../../types/formBag'

export type AddResourceFormData = {
  name: string
  summary: string
}
export type AddResourceFormProps = {
  form: FormBag<AddResourceFormData>
}
export const AddResourceForm: FC<AddResourceFormProps> = ({ form }) => {
  return (
    <Form disabled={form.isSubmitting} onSubmit={form.submitForm}>
      <Form.Group widths="equal">
        <Form.Input onChange={form.handleChange} fluid label={t`Name`} placeholder={t`Name`} {...form.valueName.name} />
        <Form.TextArea
          onChange={form.handleChange}
          fluid
          label={t`Summary`}
          placeholder={t`Summary ...`}
          {...form.valueName.summary}
        />
      </Form.Group>
      <Form.Button>
        <Trans>Submit</Trans>
      </Form.Button>
    </Form>
  )
}
