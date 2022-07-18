import lib from 'moodlenet-react-app-lib'
import React, { FC, useContext, useRef } from 'react'
import { PassportConfigs } from '../store/types'
import { PassportContext } from './MainProvider'

const { Card, InputTextField, PrimaryButton } = lib.ui.components.atoms

export const FormConfig: FC = () => {
  const apiKeyRef = useRef<HTMLInputElement>(null)
  const apiSecretRef = useRef<HTMLInputElement>(null)
  const ctx = useContext(PassportContext)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (!(apiKeyRef.current && apiSecretRef.current)) {
      return
    }
    event.preventDefault()
    const configs: PassportConfigs = {
      google: {
        apiKey: apiKeyRef.current.value,
        apiSecret: apiSecretRef.current.value,
      },
    }
    ctx.save(configs)
  }

  return (
    <Card>
      <div className="title">Google Config Api Key</div>
      <form onSubmit={handleSubmit}>
        <div className="option">
          <div className="name">Api Key</div>

          <InputTextField
            ref={apiKeyRef}
            type={'text'}
            placeholder={'Api Key'}
            defaultValue={ctx.configs.google?.apiKey}
            edit
          />
        </div>

        <div className="option">
          <div className="name">Api Secret</div>
          <InputTextField
            ref={apiSecretRef}
            type={'text'}
            placeholder={'Api Secret'}
            defaultValue={ctx.configs.google?.apiSecret}
            edit
          />
        </div>

        <PrimaryButton type="submit">Save</PrimaryButton>
      </form>
    </Card>
  )
}
