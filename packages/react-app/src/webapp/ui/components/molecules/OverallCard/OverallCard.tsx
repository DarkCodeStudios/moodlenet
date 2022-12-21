// import { t, Trans } from '@lingui/macro'
import { Card } from '@moodlenet/component-library'
// import { Card } from '@moodlenet/react-app'
import { ComponentType, FC } from 'react'
import { Href, Link } from '../../elements/link.js'
// import { Href, Link } from '../../../../elements/link'
import './OverallCard.scss'

export type OverallCardItem = {
  Icon: ComponentType
  name: string
  value: string | number
  href?: Href
}

export type OverallCardProps = {
  items?: OverallCardItem[]
  hideBorderWhenSmall?: boolean
  noCard?: boolean
  showIcons?: boolean
}

export const OverallCard: FC<OverallCardProps> = ({
  items,
  hideBorderWhenSmall,
  showIcons,
  noCard,
}) => {
  return (
    <Card
      className="overall-card"
      key="overall-card"
      hideBorderWhenSmall={hideBorderWhenSmall}
      noCard={noCard}
    >
      <div className="overall-container">
        {!items || items.length === 0
          ? // <Trans>
            'No stats available'
          : // </Trans>
          showIcons
          ? items?.map(item => {
              return (
                <div className="data" key="item.name">
                  <abbr title={/* t */ `${item.name}`}>
                    <item.Icon />
                  </abbr>
                  {item.value}
                </div>
              )
            })
          : items?.map(item => {
              return item.href ? (
                <Link href={item.href} className="data" key={item.name}>
                  {item.value}
                  <span>
                    {/* <Trans> */}
                    {item.name}
                    {/* </Trans> */}
                  </span>
                </Link>
              ) : (
                <div className="data" key={item.name}>
                  {item.value}
                  <span>
                    {/* <Trans> */}
                    {item.name}
                    {/* </Trans> */}
                  </span>
                </div>
              )
            })}
      </div>
    </Card>
  )
}

OverallCard.defaultProps = {
  showIcons: false,
}