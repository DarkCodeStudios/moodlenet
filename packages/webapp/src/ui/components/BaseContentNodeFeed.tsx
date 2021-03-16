import { FC } from 'react'
import { Item } from 'semantic-ui-react'
import { LinkDef, useLink } from '../context'
import { UseProps } from '../types'

export type BaseContentNodeFeedProps = {
  useProps: UseBaseContentNodeFeedProps
}
export type UseBaseContentNodeFeedProps = UseProps<{
  icon: string | null
  name: string
  summary: string
  type: string
  link: LinkDef
} | null>
export const BaseContentNodeFeed: FC<BaseContentNodeFeedProps> = ({ useProps }) => {
  const Link = useLink()
  const props = useProps()
  if (!props) {
    return null
  }
  const { icon, name, summary, type, link } = props
  return (
    <Item>
      <Item.Image size="tiny" src={icon} />

      <Item.Content>
        <Link href={link}>
          <Item.Header>{name}</Item.Header>
        </Link>
        <Item.Meta>{type}</Item.Meta>
        <Item.Description>{summary}</Item.Description>
      </Item.Content>
    </Item>
  )
}
