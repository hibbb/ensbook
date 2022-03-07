
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { t } from 'i18next';

export default function LanguageSwitcher(props) {
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
    <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('header.language')}</Tooltip>}>
      <span className="lang-span">
        <select id="select-lang" className="ms-2 select-lang" aria-label="language" 
          name="language" 
          value={usingLang} 
          onChange={() => selectLang()} >
          <option value="en">EN</option>
          <option value="cn">CN</option>
        </select>
      </span>
    </OverlayTrigger>
  )
}