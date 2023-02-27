import React from 'react';
import AppTitle from './AppTitle';
import LanguageSwitcher from './LanguageSwitcher';
import OperatorWallet from './OperatorWallet';
import ConfigureForm from './ConfigureForm';
import { getConfFixed } from '../Global/globals';

export default function Header(props) {
  const {
    conf,
    walletInfo,
    reconnectApp,
    disconnectApp,
    reconnecting,
    setAndStoreConfInfo,
  } = props;

  return (
    <div className="row mb-3">
      <div className="header-left col-md-6">
        <AppTitle
          pageTag={conf.custom.pageTag}
          pageTagColor={conf.custom.pageTagColor}
        />
      </div>
      <div className="header-right col-md-6 align-self-center">
        <LanguageSwitcher />
        <ConfigureForm
          host={conf.host}
          reconnectApp={reconnectApp}
          setAndStoreConfInfo={setAndStoreConfInfo}
        />
        <OperatorWallet
          walletInfo={walletInfo}
          reconnectApp={reconnectApp}
          disconnectApp={disconnectApp}
          reconnecting={reconnecting}
          scanConf={getConfFixed().scanConf}
        />
      </div>
    </div>
  );
}
