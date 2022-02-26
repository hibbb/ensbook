import React from 'react';
import AppTitle from './AppTitle';
import LanguageSwitcher from './LanguageSwitcher';
import OperatorWallet from './OperatorWallet';
import ConfigureForm from './ConfigureForm';

export default function Header(props) {
  const { conf, setENSBookState, walletInfo, updateNames, t } = props

  return (
    <div className="row mb-3">
      <div className="header-left col-md-6">
        <AppTitle 
          pageTag={conf.custom.pageTag} 
          pageTagColor={conf.custom.pageTagColor} 
        />
      </div> 
      <div className="header-right col-md-6 align-self-center">
        <LanguageSwitcher 
          t={t}
        />
        <OperatorWallet 
          conf={conf}
          setENSBookState={setENSBookState}
          //walletInfo={walletInfo}
          t={t}
        />
        <ConfigureForm 
          host={conf.host}
          updateNames={updateNames} 
          t={t}
        />
      </div>
    </div>
  )

}