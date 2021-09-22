import BookmarkIcon from '@material-ui/icons/Bookmark'
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder'
import PermIdentityIcon from '@material-ui/icons/PermIdentity'
import PersonIcon from '@material-ui/icons/Person'
import { Href, Link } from '../../../elements/link'
import { withCtrl } from '../../../lib/ctrl'
import defaultBackgroud from '../../../static/img/default-background.svg'
import '../../../styles/tags.css'
import Card from '../../atoms/Card/Card'
import './styles.scss'

export type CollectionCardProps = {
  imageUrl: string | null
  title: string
  collectionHref: Href
  isAuthenticated: boolean
  isOwner: boolean
  isEditing?: boolean
  bookmarked: boolean
  following: boolean
  numFollowers: number
  toggleFollow?: () => unknown
  toggleBookmark?: () => unknown
}

export const CollectionCard = withCtrl<CollectionCardProps>(
  ({
    imageUrl,
    title,
    isAuthenticated,
    isOwner,
    bookmarked,
    following,
    numFollowers,
    toggleBookmark,
    toggleFollow,
    collectionHref,
  }) => {
    const background = {
      backgroundImage: 'url(' + (imageUrl || defaultBackgroud) + ')',
      backgroundSize: 'cover',
    }

    return (
      <Card className="collection-card" style={background} hover={true}>
        <div className={`actions`}>
          <div
            className={`follow ${following ? 'following' : ''} ${!isAuthenticated || isOwner ? 'disabled' : ''}`}
            onClick={isAuthenticated && !isOwner ? toggleFollow : () => {}}
          >
            {following ? <PersonIcon /> : <PermIdentityIcon />}
            <span>{numFollowers}</span>
          </div>
          {isAuthenticated && (
            <div className={`bookmark ${bookmarked ? 'bookmarked' : ''}`} onClick={toggleBookmark}>
              {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </div>
          )}
        </div>
        <Link href={collectionHref}>
          <div className="title">
            <abbr title={title}>{title}</abbr>
          </div>
        </Link>
      </Card>
    )
  },
)
CollectionCard.displayName = 'CollectionCard'
CollectionCard.defaultProps = {}