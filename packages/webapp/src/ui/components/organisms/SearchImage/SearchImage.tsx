import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import { Basic } from 'unsplash-js/dist/methods/photos/types'
import { getUnsplashImages } from '../../../../helpers/utilities'
import { ReactComponent as SearchIcon } from '../../../assets/icons/search.svg'
import InputTextField from '../../atoms/InputTextField/InputTextField'
import Loading from '../../atoms/Loading/Loading'
import Modal from '../../atoms/Modal/Modal'
import PrimaryButton from '../../atoms/PrimaryButton/PrimaryButton'
import './styles.scss'

export type SearchImageProps = {
  setImage: (photo: Basic | undefined) => void

  onClose: () => void
}

// const stopPropagation = (event: React.MouseEvent) => event.stopPropagation()

export const SearchImage: React.FC<SearchImageProps> = ({
  onClose,
  setImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [tmpSearchQuery, setTmpSearchQuery] = useState('')
  const [unsplashImages, setUnsplashImages] = useState<Basic[]>()
  const [column1, setColumn1] = useState<ReactElement[] | undefined>()
  const [column2, setColumn2] = useState<ReactElement[] | undefined>()
  const [showImages, setShowImages] = useState(false)
  const [loadedImages, setLoadedImages] = useState(0)

  const searchUnsplashImages = (query: string) => {
    const photos = getUnsplashImages(query)
    photos.then((photos) => {
      if (photos) {
        setUnsplashImages(photos)
        setShowImages(false)
        setLoadedImages(0)
      }
    })
  }

  const getImagesColumn = useCallback(
    (photos: Basic[] | undefined) => {
      return photos?.map((photo, i) => (
        <div className="image-container" key={i}>
          <div
            className="image"
            onClick={() => {
              setImage(photo)
              onClose()
            }}
          >
            <img
              src={`${(photo as Basic).urls.small}`}
              alt=""
              onLoad={() => setLoadedImages((prevState) => prevState + 1)}
            />
            <div className="active-overlay" />
            <a
              className="credits"
              href={photo.user.links.html}
              target="_blank"
              rel="noreferrer"
            >
              {photo.user.first_name} {photo.user.last_name}
            </a>
          </div>
        </div>
      ))
    },
    [setImage, onClose, setLoadedImages]
  )

  useEffect(() => {
    console.log('totalImages ', unsplashImages?.length)
    console.log('loadedImages ', loadedImages)
    loadedImages === unsplashImages?.length && setShowImages(true)
  }, [loadedImages, unsplashImages])

  // useEffect(() => {
  //   unsplashImages && setTimeout(() => setShowImages(true), 200)
  // }, [unsplashImages])

  useEffect(() => {
    let totalHeight = 0
    unsplashImages?.map((photo) => {
      return (totalHeight += photo.height / (photo.width / 100))
    })
    const columnMaxHeight = totalHeight / 2
    let i = 0
    let height = 0
    unsplashImages?.every((photo) => {
      height += photo.height / (photo.width / 100)
      i++
      if (height < columnMaxHeight) return true
      return false
    })
    setColumn1(getImagesColumn(unsplashImages?.slice(0, i)))
    setColumn2(getImagesColumn(unsplashImages?.slice(i)))
  }, [unsplashImages, getImagesColumn])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === 'Enter' &&
      !(
        (tmpSearchQuery === '' && searchQuery === '') ||
        tmpSearchQuery === searchQuery
      )
    ) {
      setSearchQuery(tmpSearchQuery)
      tmpSearchQuery !== '' && searchUnsplashImages(tmpSearchQuery)
    }
  }

  const sampleQuerySet = () => {
    const querySet = [
      'abstract',
      'animal',
      'architecture',
      'art',
      'interior',
      'business',
      'colorful',
      'food',
      'interior',
      'minimal',
      'nature',
      'plant',
      'portrait',
      'space',
      'technology',
      'texture',
      'wallpaper',
    ]
    return querySet.map((query, i) => {
      return (
        <PrimaryButton
          key={i}
          color="card"
          onClick={() => {
            setTmpSearchQuery(query)
            setSearchQuery(query)
            searchUnsplashImages(query)
          }}
        >
          {query}
        </PrimaryButton>
      )
    })
  }

  const searchBox = (
    <div className="image-search-box">
      <InputTextField
        placeholder="Search Unsplash photos"
        edit={true}
        onKeyDown={handleKeyDown}
        value={tmpSearchQuery}
        onChange={(v) => setTmpSearchQuery(v.currentTarget.value)}
      />
      <PrimaryButton
        className="search-button"
        color="blue"
        disabled={
          (tmpSearchQuery === '' && searchQuery === '') ||
          tmpSearchQuery === searchQuery
        }
        onClick={() => searchUnsplashImages(tmpSearchQuery)}
      >
        <SearchIcon />
      </PrimaryButton>
    </div>
  )

  return (
    <Modal className="search-image" onClose={onClose} closeButton={false}>
      {searchBox}
      {searchQuery === '' ? (
        <div className="sample-queries-container">{sampleQuerySet()}</div>
      ) : (
        <>
          <div
            className="images-container"
            style={{ display: showImages ? 'flex' : 'none' }}
          >
            <div className="column-1">{column1}</div>
            <div className="column-2">{column2}</div>
          </div>
          {!showImages && <Loading size={30} />}
        </>
      )}
    </Modal>
  )
}
SearchImage.defaultProps = {}

export default SearchImage
