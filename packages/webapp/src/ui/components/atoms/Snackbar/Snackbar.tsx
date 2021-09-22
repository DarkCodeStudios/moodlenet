import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import CloseRoundedIcon from '@material-ui/icons/CloseRounded'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import React, { useCallback, useEffect, useState } from 'react'
import Card from '../Card/Card'
import './styles.scss'

export type SnackbarProps = {
  actions?: React.ReactNode
  icon?: React.ReactNode
  showIcon?: boolean
  buttonText?: string
  style?: React.CSSProperties
  type?: 'error' | 'warning' | 'info' | 'success'
  className?: string
  autoHideDuration?: number
  onClose?: () => void
}

const stopPropagation = (event: React.MouseEvent) => event.stopPropagation()

export const Snackbar: React.FC<SnackbarProps> = ({
  onClose,
  actions,
  icon,
  showIcon,
  style,
  buttonText,
  className,
  type,
  autoHideDuration,
  children,
}) => {
  const [movementState, setMovementState] = useState<'opening' | 'closing'>('opening')
  const handleonClose = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation()
      setMovementState('closing')
      setTimeout(() => {
        onClose && onClose()
      }, 100)
    },
    [onClose],
  )

  useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        handleonClose()
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
    return
  }, [autoHideDuration, handleonClose])

  return (
    <Card className={`snackbar ${className} type-${type} state-${movementState}`} onClick={stopPropagation} style={style}>
      {showIcon && (icon || type) && (
        <div className="icon">
          {icon
            ? { icon }
            : (() => {
                switch (type) {
                  case 'error':
                    return <ErrorOutlineIcon />
                  case 'warning':
                    return <ReportProblemOutlinedIcon />
                  case 'info':
                    return <InfoOutlinedIcon />
                  case 'success':
                    return <CheckCircleOutlineOutlinedIcon />
                  default:
                    return null
                }
              })()}
        </div>
      )}
      <div className="content">{children}</div>
      {actions && <div className="actions">{actions}</div>}
      <div className="close-button" onClick={handleonClose}>
        {buttonText ? <span>{buttonText}</span> : <CloseRoundedIcon />}
      </div>
    </Card>
  )
}
Snackbar.defaultProps = {
  className: '',
  showIcon: true,
}

export default Snackbar