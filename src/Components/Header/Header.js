import React from 'react';
import AppTitle from './AppTitle';
import LanguageSwitcher from './LanguageSwitcher';
import OperatorWallet from './OperatorWallet';
import ConfigureForm from './ConfigureForm';

export default function Header(props) {
  const { conf, walletInfo, setAndStoreConfInfo, resetAndStoreConfInfo, confFile, updateNames, t } = props

  return (
    <div className="row mb-3">
      <AppTitle 
        pageTag={conf.custom.pageTag} 
        pageTagColor={conf.custom.pageTagColor} 
      />
      <div className="header-right col-md-6 align-self-center">
        <LanguageSwitcher 
          t={t}
        />
        <span className={"network px-2 network-"+ conf.custom.network}>{t('c.' + conf.custom.network)}</span>
        <OperatorWallet 
          conf={conf}
          walletInfo={walletInfo}
          t={t}
        />
        <ConfigureForm 
          host={conf.host}
          setAndStoreConfInfo={setAndStoreConfInfo} 
          resetAndStoreConfInfo={resetAndStoreConfInfo}
          confFile={confFile}
          updateNames={updateNames} 
          t={t}
        />
      </div>
    </div>
  )

}