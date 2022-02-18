import React from 'react';
import { LabelCell, LookupCell, StatusCell, RegisterCell, DelCell } from './TableCells';

export const TableBody = (props) => {
  const { 
    nameInfo, 
    setAndStoreNameInfo, 
    conf, 
    updateName, 
    register, 
    hideNames, 
    registrableStatuses, 
    removeName, 
    estimatePrice,
    book, 
    cancelBook, 
    t 
  } = props

  const rows = props.nameInfo.map((row, index) => {
    if (hideNames && registrableStatuses.indexOf(row.status) < 0) {
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
            t={t}
          />
        </td>
        <td>
          <RegisterCell 
            label={row.label} 
            index={index}
            status={row.status} 
            expiresTime={row.expiresTime}
            estimatePrice={estimatePrice}
            register={register} 
            book={book}
            cancelBook={cancelBook}
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