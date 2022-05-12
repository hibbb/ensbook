import React, { useState } from 'react';
import { utils } from 'ethers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Calculator } from 'react-bootstrap-icons';
import { t } from 'i18next';
import { isRegistrable } from '../../Global/globals';
import TooltipEstimateCost from '../TooltipEstimateCost';
import RegistrationModal from '../../Utils/RegistrationModal';


export const RegisterCell = (props) => {
  const { 
    label, 
    status, 
    reconnecting, 
    defaultDuration, 
    registerName, 
    regStep, 
    estimateCost, 
    registerNameEnd, 
    regMsges, 
    getDefaultNameReceiver,
    type 
  } = props

  const initialEstimating = { 
    title: "tb.td.tips.est", 
    status: "before", 
    cost: "" 
  }
  const [estimating, setEstimating] = useState(initialEstimating);

  const estimateThis = async () => {
    setEstimating({ ...initialEstimating, status: "in" })
    const costEther = utils.formatEther(await estimateCost(label))
    setEstimating({ ...initialEstimating, status: "after", cost: costEther })
  }

  const [modalShow, setModalShow] = useState(false)

  if (isRegistrable(status)) {
    return (
      <div id={"registerName-" + label} className="btn-group" role="group" aria-label="RegisterName or Estimate Price">
        <OverlayTrigger placement="top" overlay={
          <Tooltip>{
            regStep > 0
            ? t('tb.td.tips.continue')
            : t('tb.td.tips.reg', {label: label})
          }</Tooltip>
        }>
          <button type="button" 
            disabled={type==='readonly' || reconnecting}
            className="btn-plain btn-reg" 
            onClick={()=>setModalShow(true)} 
          >
            {
              regStep > 0
              ? t('tb.td.continue')
              : t('tb.td.reg')
            }
          </button>
        </OverlayTrigger>
        {
          regStep > 0
          ? <OverlayTrigger placement="top" overlay={
              <Tooltip>
                {t('tb.td.tips.regStep', {regStep: regStep})}
              </Tooltip>
            }>
              <span className="ms-2 td-reg-step">
                {regStep}/3
              </span>
            </OverlayTrigger>
          : <OverlayTrigger placement="top" overlay={
              <Tooltip>
                <TooltipEstimateCost estimating={estimating} t={t} />
              </Tooltip>
            }>
              <button type="button" className="btn-plain btn-sub ms-2" onClick={()=>estimateThis()}>
                <Calculator />
              </button>
            </OverlayTrigger>
        }
        <RegistrationModal 
          show={modalShow}
          onHide={()=>setModalShow(false)}
          defaultDuration={defaultDuration}
          label={label} 
          registerName={registerName} 
          regStep={regStep}
          registerNameEnd={registerNameEnd}
          regMsges={regMsges}
          getDefaultNameReceiver={getDefaultNameReceiver}
          t={t} 
        />
      </div>
    )
  }

  if (status === 'Unknown') {
    return (
      <div id={"trigger-unknown-" + label} className="btn-group" role="group" aria-label="Unknown">
        <button type="button" className="btn-plain" disabled>
          {t('nm.sta.Unknown')}
        </button>
      </div>
    )
  }

  return (
    <div id={"trigger-reged-" + label} className="btn-group" role="group" aria-label="RegisterName">
      <button type="button" className="btn-plain" disabled>
        {t('tb.td.reged')}
      </button>
    </div>
  )
}
