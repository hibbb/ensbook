
import React from 'react';
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default function LanguageSwitcher() {

  const usingLang = window.localStorage.getItem('language') ?? 'en'
  const { i18n } = useTranslation()
  moment.locale(usingLang === 'cn' ? 'zh-cn' : usingLang)

  const selectLang = () => {
    const value = document.getElementById('select-lang').value
    window.localStorage.setItem('language', value)
    i18n.changeLanguage(value)
    moment.locale(value === 'cn' ? 'zh-cn' : value)
  }

  return (
    <span className="lang-span">
      <select id="select-lang" className="select-lang" aria-label="language" 
        name="language" 
        value={usingLang} 
        onChange={() => selectLang()} >
        <option value="en">EN</option>
        <option value="cn">CN</option>
      </select>
    </span>
  )
}