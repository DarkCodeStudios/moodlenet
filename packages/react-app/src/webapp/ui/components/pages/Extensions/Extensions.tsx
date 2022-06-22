import React, { FC, useContext, useEffect, useState } from 'react'
import Card from '../../atoms/Card/Card'
import { StateContext } from '../../layout/ContextProvider'
import Modules, { ModulesProps } from './Modules/Modules'
import Packages from './Packages/Packages'
import SearchExtensions from './SearchExtensions/SearchExtensions'
// import {
//   HeaderPageTemplate,
//   HeaderPageTemplateProps,
// } from '../../templates/HeaderPageTemplate'
// import Extensions, { ExtensionsProps } from './Extensions/Extensions'
import './styles.scss'

type SectionNameType = 'Account' | 'Extension' | 'Packages' | 'Modules' | 'SearchExtensions'

export type ExtensionsProps = {
  sectionProps: ModulesProps | ExtensionsProps
  section: SectionNameType
  // headerPageTemplateProps: CP<HeaderPageTemplateProps>
}

type SectionType = {
  name: SectionNameType
  component: typeof Packages | typeof Modules
  displayName: 'Account' | 'Modules' | 'Extensions' | 'Install'
}

const sections: SectionType[] = [
  { name: 'SearchExtensions', component: SearchExtensions, displayName: 'Install' },
  { name: 'Packages', component: Packages, displayName: 'Extensions' },
  { name: 'Modules', component: Modules, displayName: 'Modules' },
]

export const Extensions: FC<ExtensionsProps> = ({
  sectionProps,
  section = 'SearchExtensions' /* , headerPageTemplateProps */,
}) => {
  const stateContext = useContext(StateContext)
  const [currentSection, setCurrentSection] = useState(section)
  const [currentContent, setCurrentContent] = useState<any>(null)
  // const [menuItemPressed, setMenuItemPressed] = useState<any>(false)
  const menu = sections.map(
    (e, i) =>
      (stateContext?.devMode || e.name !== 'Modules') && (
        <div
          key={i}
          className={`section ${e.name === currentSection ? 'selected' : ''}`}
          onClick={() => {
            setCurrentSection(e.name)
            // setMenuItemPressed(true)
            // setMenuItemPressed(false)
          }}
        >
          {e.displayName}
          {/* <Trans>{e.displayName}</Trans> */}
        </div>
      ),
  )

  useEffect(() => {
    const sectionComponent = sections.filter(e => e.name === currentSection)
    const content = sectionComponent[0]
      ? React.createElement(sectionComponent[0].component, {
          ...(sectionProps as any),
          // menuItemPressed: menuItemPressed,
        })
      : null
    setCurrentContent(content)
  }, [currentSection])

  return (
    // <HeaderPageTemplate {...headerPageTemplateProps}>
    <div className="extensions">
      <div className="left-menu">
        <Card>{menu}</Card>
      </div>
      <div className="content">{currentContent}</div>
    </div>
    // </HeaderPageTemplate>
  )
}

export default Extensions

Extensions.displayName = 'ExtensionsPage'
