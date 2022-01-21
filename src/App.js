import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/App.css'
import ENSBook from './ENSBook';
import { useTranslation } from 'react-i18next';
import { utils } from 'ethers';

export default function App() {
  const {t} = useTranslation()

  if (window.localStorage.getItem('openString') === null) {
    window.localStorage.setItem('openString', '')
  }
  const openString = utils.id(window.localStorage.getItem('openString'))
  if (openString.slice(-10) === '2b80564ba2') {
    return (
      <ENSBook t={t} />
    );  
  } else {
    return (
      <h2 className='mt-5 text-center'>This APP is building.</h2>
    );
  }
}

