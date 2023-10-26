import React from 'react';
import { fetchChainId, getETHPrice, isMyName, isRegistrable, readCon } from '../Global/globals';
import { LabelCell } from './TableCells/LabelCell';
import { LookupCell } from './TableCells/LookupCell';
import { StatusCell } from './TableCells/StatusCell';
import { RegisterCell } from './TableCells/RegisterCell';
import { DelCell } from './TableCells/DelCell';
import { RenewCell } from './TableCells/RenewCell';
import { walletClient } from '../Global/clients';

export const TableBody = (props) => {
  const {
    reconnecting,
    nameInfo,
    setAndStoreNameInfo,
    conf,
    ethPrice,
    walletAddress,
    chainId,
    updateNames,
    registerName,
    registerNameEnd,
    addNameToRegList,
    removeNameFromRegList,
    renewName,
    renewNameEnd,
    addNameToRenewList,
    removeNameFromRenewList,
    hideNames,
    removeName,
    estimateCost,
    regMsges,
    renewMsges,
    getDefaultNameReceiver,
  } = props;

  const rows = props.nameInfo.map((row, index) => {
    if (hideNames && !isRegistrable(row.status)) {
      return null;
    }

    return (
      <tr key={index} className="ebr-tb-row">
        <td className="td-index">{index + 1}</td>
        <td className="td-name-label">
          <LabelCell
            label={row.label}
            index={index}
            level={row.level}
            wrapped={row.wrapped}
            isMyName={isMyName(row.owner, walletAddress)}
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
          />
        </td>
        <td>
          <StatusCell
            label={row.label}
            index={index}
            status={row.status}
            ethPrice={ethPrice}
            reconnecting={reconnecting}
            registrationTime={row.registrationTime}
            expiresTime={row.expiresTime}
            releaseTime={row.releaseTime}
            updateNames={updateNames}
            defaultDuration={conf.custom.register.duration}
            renewName={renewName}
            renewNameEnd={renewNameEnd}
            renewMsges={renewMsges}
            priceUnit={conf.custom.premium.priceUnit}
            priceRange={conf.custom.premium.priceRange}
          />
        </td>
        <td className="td-lookup">
          <LookupCell
            label={row.label}
            status={row.status}
            tokenId={row.tokenId}
            owner={row.owner}
            wrapped={row.wrapped}
            conf={conf}
            chainId={chainId}
          />
        </td>
        <td>
          <RegisterCell
            label={row.label}
            index={index}
            defaultDuration={conf.custom.register.duration}
            status={row.status}
            reconnecting={reconnecting}
            estimateCost={estimateCost}
            registerName={registerName}
            regStep={row.regStep}
            registerNameEnd={registerNameEnd}
            addNameToRegList={addNameToRegList}
            removeNameFromRegList={removeNameFromRegList}
            regMsges={regMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
        </td>
        <td>
          <RenewCell
            label={row.label}
            status={row.status}
            expiresTime={row.expiresTime}
            defaultDuration={conf.custom.renew.duration}
            renewName={renewName}
            renewNameEnd={renewNameEnd}
            renewMsges={renewMsges}
            reconnecting={reconnecting}
            addNameToRenewList={addNameToRenewList}
            removeNameFromRenewList={removeNameFromRenewList}
          />
        </td>
        <td>
          <DelCell label={row.label} index={index} removeName={removeName} />
        </td>
      </tr>
    );
  });

  return <tbody>{rows}</tbody>;
};
