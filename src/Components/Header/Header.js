import React from 'react';
import AppTitle from './AppTitle';
import LanguageSwitcher from './LanguageSwitcher';
import OperatorWallet from './OperatorWallet';
import ConfigureForm from './ConfigureForm';

export default function Header(props) {
  const { conf, walletInfo, reconnectApp, disconnectApp, reconnecting, t } = props

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
        <ConfigureForm 
          host={conf.host}
          reconnectApp={reconnectApp}
          t={t}
        />
        <OperatorWallet 
          walletInfo={walletInfo}
          reconnectApp={reconnectApp}
          disconnectApp={disconnectApp}
          reconnecting={reconnecting}
          scanConf={conf.fixed.scanConf}
          t={t}
        />
      </div>
    </div>
  )

}