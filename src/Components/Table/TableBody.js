import React from 'react';
import { LabelCell, LookupCell, StatusCell, RegisterCell, DelCell } from './TableCells';

export const TableBody = (props) => {
  const { 
    nameInfo, 
    setAndStoreNameInfo, 
    conf, 
    updateName, 
    isRenewable, 
    register, 
    hideNames, 
    isRegistrable, 
    removeName, 
    estimatePrice,
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
            isRenewable={isRenewable}
            t={t}
          />
        </td>
        <td>
          <RegisterCell 
            label={row.label} 
            index={index}
            status={row.status} 
            estimatePrice={estimatePrice}
            register={register} 
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