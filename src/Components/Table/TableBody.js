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
    updateNameByLabel, 
    updateBalance, 
    registerName, 
    hideNames, 
    removeName, 
    estimateCost,
    messages, 
    t 
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
        <td className='td-lookup'>
          <LookupCell
            label={row.label}
            tokenId={row.tokenId}
            conf={conf}
            network={network}
            t={t}
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
            type={type}
            t={t}
          />
        </td>
        <td>
          <RegisterCell 
            label={row.label} 
            index={index}
            status={row.status} 
            estimateCost={estimateCost}
            registerName={registerName} 
            updateNameByLabel={updateNameByLabel}
            updateBalance={updateBalance}
            messages={messages}
            type={type}
            t={t}
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