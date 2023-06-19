import { overrideDeep } from '@moodlenet/component-library/common'
import type {
  EdMetaOptionsProps,
  ResourceAccessProps,
  ResourceActions,
  ResourceDataProps,
  ResourceFormProps,
  ResourceStateProps,
} from '@moodlenet/ed-resource/common'
import { resourceValidationSchema } from '@moodlenet/ed-resource/common'
import { action } from '@storybook/addon-actions'
import type { ComponentMeta } from '@storybook/react'
import type { PartialDeep } from 'type-fest'
// import { useEffect } from 'react'
import type { AnySchema } from 'yup'
import { addMethod, MixedSchema } from 'yup'
// import { href } from '../../../elements/link'
// import { TagListStory } from '../../../elements/tags'
// import { HeaderLoggedOutStoryProps } from '../../organisms/Header/Header.stories'
// import { HeaderPageTemplateProps } from '../../templates/HeaderPageTemplate'
// import { HeaderPageLoggedInStoryProps } from '../HeaderPage/HeaderPage.stories'
// import { ResourceTextOptionProps } from '../NewResource/AddToResources/storiesData'
import type { AddonItem } from '@moodlenet/component-library'

// import {
// import { Resource, ResourceProps } from '@moodlenet/ed-resource/ui'
// import { useFormik } from 'formik'
import { AddToCollectionButtonStories } from '@moodlenet/collection/stories'
import { FieldsDataStories } from '@moodlenet/ed-meta/stories'
import { ResourceContributorCardStories } from '@moodlenet/ed-resource/stories'
import type { MainResourceCardSlots, ResourceProps } from '@moodlenet/ed-resource/ui'
import { Resource } from '@moodlenet/ed-resource/ui'
import { href } from '@moodlenet/react-app/common'
import type { BookmarkButtonProps, LikeButtonProps } from '@moodlenet/web-user/ui'
import { BookmarkButton, LikeButton } from '@moodlenet/web-user/ui'
import { useFormik } from 'formik'
import { useState } from 'react'
import {
  MainLayoutLoggedInStoryProps,
  MainLayoutLoggedOutStoryProps,
} from '../../layout/MainLayout/MainLayout.stories.js'

const meta: ComponentMeta<typeof Resource> = {
  title: 'Pages/Resource',
  component: Resource,
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  parameters: { layout: 'fullscreen' },
  excludeStories: [
    'ResourceFormProps',
    'ResourceStoryProps',
    'resourceFormBag',
    'ResourceStoryProps',
    'ResourceLinkLoggedOutStoryProps',
    'ResourceFileLoggedOutStoryProps',
    'ResourceLoggedInStoryProps',
    'ResourceOwnerStoryProps',
    'ResourceAdminStoryProps',
    'validationSchema',
    'useResourceForm',
    'useResourceStoryProps',
    'CollectionTextOptionProps',
    'ResourceFormValues',
  ],
}

addMethod(MixedSchema, 'oneOfSchemas', function (schemas: AnySchema[]) {
  return this.test(
    'one-of-schemas',
    'Not all items in ${path} match one of the allowed schemas',
    item => schemas.some(schema => schema.isValidSync(item, { strict: true })),
  )
})

export const ResourceFormValues: ResourceFormProps = {
  title: '',
  description:
    'Earth 2020: An Insider’s Guide to a Rapidly Changing Planet responds to a public increasingly concerned about the deterioration of Earth’s natural systems, offering readers a wealth of perspectives on our shared ecological past, and on the future trajectory of planet Earth. Written by world-leading thinkers on the front-lines of global change research and policy, this multi-disciplinary collection maintains a dual focus: some essays investigate specific facets of the physical Earth system, while others explore the social, legal and political dimensions shaping the human environmental footprint. In doing so, the essays collectively highlight the urgent need for collaboration across diverse domains of expertise in addressing one of the most significant challenges facing us today. Earth 2020 is essential reading for everyone seeking a deeper understanding of the past, present and future of our planet, and the role of humanity in shaping this trajectory.',
  subject: FieldsDataStories.SubjectsTextOptionProps[2]!.value,
  language: FieldsDataStories.LanguagesTextOptionProps[2]!.value,
  level: FieldsDataStories.LevelTextOptionProps[2]!.value,
  license: FieldsDataStories.LicenseIconTextOptionProps[2]!.value,
  month: FieldsDataStories.MonthTextOptionProps[8]!.value,
  year: FieldsDataStories.YearsProps[20],
  type: FieldsDataStories.TypeTextOptionProps[1]!.value,
}

export const useResourceForm = (overrides?: Partial<ResourceFormProps>) => {
  return useFormik<ResourceFormProps>({
    validationSchema: resourceValidationSchema,
    onSubmit: action('submit edit'),
    initialValues: {
      title: 'Best resource ever',
      description:
        'This is the description that tells you that this is not only the best content ever, but also the most dynamic and enjoyable you will never ever find. Trust us.This is the description that tells you that this is not only the best content ever, but also the most dynamic and enjoyable you will never ever find. Trust us.',
      subject: '',
      license: '',
      type: '',
      language: '',
      level: '',
      month: '',
      year: '',
    },
    ...overrides,
  })
}

// export const CollectionTextOptionProps: OptionItemProp[] = [
//   { label: 'Education', value: 'Education' },
//   { label: 'Biology', value: 'Biology' },
//   { label: 'Algebra', value: 'Algebra' },
//   { label: 'Phycology', value: 'Phycology' },
//   { label: 'Phylosophy', value: 'Phylosophy' },
//   { label: 'Sociology', value: 'Sociology' },
//   { label: 'English Literature', value: 'English Literature' },
// ]

export const useResourceStoryProps = (
  overrides?: PartialDeep<
    ResourceProps & {
      isAuthenticated: boolean
      bookmarkButtonProps: BookmarkButtonProps
      likeButtonProps: LikeButtonProps
    }
  >,
  //   {
  //   props?: Partial<ResourceProps>
  //   resource?: Partial<ResourceType>
  //   resourceForm?: Partial<ResourceFormProps>
  //   actions?: Partial<ResourceActions>
  //   access?: Partial<ResourceAccess>
  //   mainResourceCardSlots?: Partial<MainResourceCardSlots>
  // }
): ResourceProps => {
  const [filename, setFilename] = useState<string | null>('filename.pdf')

  const isAuthenticated = overrides?.isAuthenticated ?? true

  const resourceForm: ResourceFormProps = {
    title: 'Best resource ever',
    description:
      'This is the description that tells you that this is not only the best content ever, but also the most dynamic and enjoyable you will never ever find. Trust us. This is the description that tells you that this is not only the best content ever, but also the most dynamic and enjoyable you will never ever find. Trust us. This is the description that tells you that this is not only the best content ever, but also the most dynamic and enjoyable you will never ever find. Trust us.',
    subject: '0011',
    license: 'CC-0 (Public domain)',
    type: undefined, //'Course',
    language: undefined,
    level: undefined,
    month: undefined,
    year: undefined,
    ...overrides?.resourceForm,
  }

  const data: ResourceDataProps = {
    id: 'qjnwglkd69io-sports',
    mnUrl: 'resource.url',
    contentUrl: 'https://www.africau.edu/images/default/sample.pdf',
    // contentUrl: 'https://moodle.net/profile/d488bc9d51ef-moodle-academy',
    // contentUrl: 'https://youtu.be/dZNC5kIvM00',
    // contentUrl: 'https://vimeo.com/204467192',
    imageUrl:
      'https://images.unsplash.com/photo-1543964198-d54e4f0e44e3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80',
    downloadFilename: filename,
    contentType: 'file',
    // contentType: 'link',
    ...overrides?.data,
    subjectHref: href('Pages/subject/Logged In'),
  }

  const state: ResourceStateProps = {
    isPublished: true,
    ...overrides?.state,
  }

  const setContent = (e: File | string | undefined | null) => {
    if (typeof e === 'string') {
      setFilename(null)
    } else {
      e ? setFilename(e.name) : setFilename(null)
    }
    action('set content')(e)
  }

  const actions: ResourceActions = {
    deleteResource: action('delete resource'),
    editData: action('editing resource submited'),
    publish: action('publish'),
    unpublish: action('unpublish'),
    setContent: setContent,
    setImage: action('set image'),
    ...overrides?.actions,
  }

  const access: ResourceAccessProps = {
    canEdit: false,
    isCreator: false,
    canDelete: false,
    canPublish: false,
    ...overrides?.access,
  }

  const edMetaOptions: EdMetaOptionsProps = {
    subjectOptions: FieldsDataStories.SubjectsTextOptionProps,
    languageOptions: FieldsDataStories.LanguagesTextOptionProps,
    levelOptions: FieldsDataStories.LevelTextOptionProps,
    licenseOptions: FieldsDataStories.LicenseIconTextOptionProps,
    monthOptions: FieldsDataStories.MonthTextOptionProps,
    yearOptions: FieldsDataStories.YearsProps,
    typeOptions: FieldsDataStories.TypeTextOptionProps,
  }

  const likeButtonProps: LikeButtonProps = {
    liked: true,
    canLike: true,
    numLikes: 10,
    toggleLike: action('toggleLike'),
    isCreator: false,
    ...overrides?.bookmarkButtonProps,
    isAuthenticated,
  }

  const bookmarkButtonProps: BookmarkButtonProps = {
    bookmarked: true,
    canBookmark: true,
    toggleBookmark: action('toggleBookmark'),
    ...overrides?.bookmarkButtonProps,
    isAuthenticated,
  }

  const isPublished =
    overrides?.state?.isPublished !== undefined ? overrides?.state?.isPublished : true

  const mainResourceCardSlots: MainResourceCardSlots = {
    mainColumnItems: [],
    headerColumnItems: [],
    topLeftHeaderItems: [],
    topRightHeaderItems: [
      isPublished
        ? {
            Item: () => <LikeButton {...likeButtonProps} />,

            key: 'like-button',
          }
        : null,
      isPublished
        ? {
            Item: () => <BookmarkButton {...bookmarkButtonProps} />,
            key: 'bookmark-button',
          }
        : null,
    ],
    moreButtonItems: [],
    footerRowItems: [],
  }

  const extraDetailsItems: AddonItem[] = []
  const generalActionsItems: AddonItem[] = [
    AddToCollectionButtonStories.useAddToCollectionButtonStory(),
  ]

  return overrideDeep<ResourceProps>(
    {
      mainLayoutProps: isAuthenticated
        ? MainLayoutLoggedInStoryProps
        : MainLayoutLoggedOutStoryProps,

      wideColumnItems: [],
      mainColumnItems: [],
      rightColumnItems: [],
      generalActionsItems: generalActionsItems,
      mainResourceCardSlots: mainResourceCardSlots,
      resourceContributorCardProps:
        ResourceContributorCardStories.ResourceContributorCardStoryProps,

      data: data,
      resourceForm: resourceForm,
      state: state,
      actions: actions,
      access: access,
      edMetaOptions: edMetaOptions,

      extraDetailsItems: extraDetailsItems,

      fileMaxSize: 343243,
      isSaving: false,
    },
    overrides,
  )
}

export default meta