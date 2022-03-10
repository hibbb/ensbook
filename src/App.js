import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import './assets/css/App.css'
import ENSBook from './ENSBook';
import { useTranslation } from 'react-i18next';

export default function App() {
  const {t} = useTranslation()
  return (
    <ENSBook t={t} />
  );  
}

