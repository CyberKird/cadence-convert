import { createContext, useContext } from 'react'
import { translator, type Translate } from '../../shared/i18n'
import type { LanguageCode } from '../../shared/types'

export interface I18n {
  t: Translate
  lang: LanguageCode
  /** What 'system' resolves to on this machine, shown in the language picker. */
  systemLang: LanguageCode
}

export const I18nContext = createContext<I18n>({ t: translator('en'), lang: 'en', systemLang: 'en' })

export function useI18n(): I18n {
  return useContext(I18nContext)
}
