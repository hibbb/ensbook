import React from 'react';
import AppTitle from './AppTitle';
import LanguageSwitcher from './LanguageSwitcher';
import ConfigureForm from './ConfigureForm';

export default function Header(props) {
  const {
    conf,
    reconnectApp,
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
        <w3m-button />
      </div>
    </div>
  );
}
