import React from 'react';
import { isCustomWallet, isRegistrable } from '../Global/globals';
import { LabelCell } from './TableCells/LabelCell';
import { LookupCell } from './TableCells/LookupCell';
import { StatusCell } from './TableCells/StatusCell';
import { RegisterCell } from './TableCells/RegisterCell';
import { DelCell } from './TableCells/DelCell';
import { RenewCell } from './TableCells/RenewCell';

export const TableBody = (props) => {
  const { 
    type,
    network, 
    reconnecting,
    nameInfo, 
    setAndStoreNameInfo, 
    conf, 
    updateNames, 
    registerName, 
    registerNameEnd, 
    addRegName,
    removeRegName,
    renewName,
    renewNameEnd,
    addRenewName,
    removeRenewName,
    hideNames, 
    removeName, 
    estimateCost,
    regMsges, 
    renewMsges,
    getDefaultNameReceiver
  } = props

  const rows = props.nameInfo.map((row, index) => {
    if (hideNames && !isRegistrable(row.status)) {
      return null
    }

    return (
      <tr key={index} className='ebr-tb-row'>
        <td>{index + 1}</td>
        <td className='td-name-label'>
          <LabelCell
            label={row.label}
            index={index}
            level={row.level}
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
          />
        </td>
        <td>
          <StatusCell
            type={type}
            label={row.label} 
            index={index}
            status={row.status} 
            reconnecting={reconnecting}
            registrationTime={row.registrationTime}
            expiresTime={row.expiresTime}
            releaseTime={row.releaseTime}
            updateNames={updateNames}
            defaultDuration={conf.custom.register.duration}
            renewName={renewName}
            renewNameEnd={renewNameEnd}
            renewMsges={renewMsges}
            priceRange={conf.custom.premium.priceRange}
          />
        </td>
        <td>
          <RegisterCell 
            type={type}
            label={row.label} 
            index={index}
            defaultDuration={conf.custom.register.duration}
            status={row.status} 
            isCustomWallet={isCustomWallet(conf)}
            reconnecting={reconnecting}
            estimateCost={estimateCost}
            registerName={registerName} 
            regStep={row.regStep}
            registerNameEnd={registerNameEnd}
            addRegName={addRegName}
            removeRegName={removeRegName}
            regMsges={regMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
        </td>
        <td>
          <RenewCell
            type={type}
            label={row.label} 
            status={row.status} 
            expiresTime={row.expiresTime}
            defaultDuration={conf.custom.renew.duration}
            renewName={renewName} 
            renewNameEnd={renewNameEnd}
            renewMsges={renewMsges}
            reconnecting={reconnecting}
            addRenewName={addRenewName}
            removeRenewName={removeRenewName}
          />
        </td>
        <td className='td-lookup'>
          <LookupCell
            label={row.label}
            status={row.status} 
            tokenId={row.tokenId}
            owner={row.owner}
            conf={conf}
            network={network}
          />
        </td>
        <td>
          <DelCell
            label={row.label}
            index={index}
            removeName={removeName}
          />
        </td>
      </tr>
    )
  })
  
  return (
    <tbody>{rows}</tbody>
  )
}