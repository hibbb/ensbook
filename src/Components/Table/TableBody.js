import React from 'react';
import { isRegistrable } from '../Global/globals';
import { LabelCell, LookupCell, StatusCell, RegisterCell, DelCell } from './TableCells';

export const TableBody = (props) => {
  const { 
    type,
    network, 
    nameInfo, 
    setAndStoreNameInfo, 
    conf, 
    updateName, 
    registerName, 
    registerNameEnd, 
    renewName,
    renewNameEnd,
    hideNames, 
    removeName, 
    estimateCost,
    regMsges, 
    renewMsges
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
            label={row.label} 
            index={index}
            status={row.status} 
            expiresTime={row.expiresTime}
            releaseTime={row.releaseTime}
            updateName={updateName}
            defaultDuration={conf.custom.register.duration}
            renewName={renewName}
            renewNameEnd={renewNameEnd}
            renewMsges={renewMsges}
            priceRange={conf.custom.premium.priceRange}
            type={type}
          />
        </td>
        <td>
          <RegisterCell 
            label={row.label} 
            index={index}
            defaultDuration={conf.custom.register.duration}
            status={row.status} 
            estimateCost={estimateCost}
            registerName={registerName} 
            regStep={row.regStep}
            registerNameEnd={registerNameEnd}
            regMsges={regMsges}
            type={type}
          />
        </td>
        <td className='td-lookup'>
          <LookupCell
            label={row.label}
            tokenId={row.tokenId}
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