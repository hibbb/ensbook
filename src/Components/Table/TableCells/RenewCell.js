import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { t } from 'i18next';
import { isRenewable } from '../../Global/globals';
import RenewalModal from '../../Utils/RenewalModal';


export const RenewCell = (props) => {
  const { 
    label, 
    status, 
    expiresTime,
    defaultDuration, 
    renewName,
    renewNameEnd,
    renewMsges,
    reconnecting, 
    addRenewName,
    removeRenewName,
    type 
  } = props

  const [modalShow, setModalShow] = useState(false)

  const handleRenewCheckboxChange = (event) => {
    const { name, checked } = event.target
    checked ? addRenewName(name) : removeRenewName(name)
  }

  if (isRenewable(status)) {
    return (
      <div id={"renewName-" + label} className="btn-group" role="group" aria-label="RenewName">
        <OverlayTrigger placement="top" overlay={
          <Tooltip>{t('tb.td.tips.addRenewName')}</Tooltip>
        }>
          <input className="form-check-input renew-checkbox" 
            type="checkbox" 
            name={label} 
            disabled={type==='readonly' || reconnecting}
            onChange={handleRenewCheckboxChange}
          />
        </OverlayTrigger>  
        <OverlayTrigger placement="top" overlay={
          <Tooltip>{t('tb.td.tips.renew', {label: label})}</Tooltip>
        }>
          <button type="button" 
            className="btn-plain ms-2" 
            disabled={type==='readonly' || reconnecting}
            onClick={()=>setModalShow(true)}
          >
            {t('tb.td.renew')}
          </button>
        </OverlayTrigger>
        <RenewalModal 
          show={modalShow} 
          onHide={()=>setModalShow(false)}
          label={label}
          expiresTime={expiresTime}
          renewName={renewName}
          renewNameEnd={renewNameEnd}
          defaultDuration={defaultDuration}
          renewMsges={renewMsges}
        />
      </div>        
    )
  }
  
  return (
    <>      
      <input className="form-check-input renew-checkbox" type="checkbox" disabled />
      <button type="button" disabled className="btn-plain ms-2">
        {t('tb.td.renew')}
      </button>
    </>
  )

}
