import React, { useState } from 'react';
import { utils } from 'ethers';
import moment from 'moment';
import Clock from 'react-live-clock';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BoxArrowUpRight, XCircle, Calculator, Calendar2Plus } from 'react-bootstrap-icons';
import { t } from 'i18next';
import { isRegistrable, isRenewable } from '../Global/globals';
import TooltipEstimateCost from './TooltipEstimateCost';
import RegistrationModal from '../Utils/RegistrationModal';
import RenewalModal from '../Utils/RenewalModal';

export const LabelCell = (props) => {
  const { label, level, index, nameInfo, setAndStoreNameInfo } = props
  // for td-label
  const nameLink = `https://app.ens.domains/name/${label}.eth`
  let labelClickCount = 0
  const oneClickToLevelUp = () => {
    labelClickCount += 1;
    setTimeout(() => {
      if (labelClickCount === 1) {
        levelUp(index)
      }
      labelClickCount = 0;
    }, 350);
  }

  const levelUp = (index) => {
    nameInfo[index].level = (nameInfo[index].level + 1) % 2
    setAndStoreNameInfo(nameInfo, false)
  } 
  
  return (
    <>
      <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.lb')}</Tooltip>}>
        <span className={`td-level td-level-${level}`} onClick={()=>oneClickToLevelUp()}>
          {label}
        </span>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>ENS APP</Tooltip>}>
        <a href={nameLink} target="_blank" rel="noreferrer">
          <BoxArrowUpRight className="external-link-icon" />
        </a>
      </OverlayTrigger>
    </>
  )
}

export const StatusCell = (props) => {
  const { label, index, status, releaseTime, expiresTime, updateName, type, renewName, renewNameEnd, defaultDuration, renewMsges } = props
  const [modalShow, setModalShow] = useState(false)

  const graceEndingFlag = status === 'Grace' && moment().add(10, 'days').isAfter(moment.unix(releaseTime))
  const graceEndingClass = graceEndingFlag ? ' grace-ending' : ''
  const premiumEndingFlag = status === 'Premium' && moment().isAfter(moment.unix(releaseTime).add(26, 'days'))
  const premiumEndingClass = premiumEndingFlag ? ' premium-ending' : ''

  const jsonSortByNumber = (array, key) => {
    if (array.length < 2 || !key || typeof array[0] !== "object" || typeof array[0][key] !== "number") {
      return array
    }
    array.sort(function(x, y) {return x[key] - y[key]})
    return array;
  }

  let tooltipArray = []

  if (expiresTime > 0) {
    switch(status) {
      case 'Normal':
      case 'Grace':
        tooltipArray[0] = {label: t('c.expiresTime'), unixTime: expiresTime}
        tooltipArray[1] = {label: t('c.releaseTime'), unixTime: releaseTime}
        tooltipArray[2] = {label: t('c.currentTime'), unixTime: moment().unix(), current: true}
        break
      case 'Premium':
      case 'Reopen':
        tooltipArray[0] = {label: t('c.expiresTime'), unixTime: expiresTime}
        tooltipArray[1] = {label: t('c.releaseTime'), unixTime: releaseTime}
        tooltipArray[2] = {label: t('c.premiumEnd'), unixTime: releaseTime + moment.duration(28, 'days').asSeconds()}
        tooltipArray[3] = {label: t('c.currentTime'), unixTime: moment().unix(), current: true}
        break
      default:
        tooltipArray[0] = {label: t('c.relatedTime'), unixTime: t('nm.sta.Unknown')}
    }  
  } else {
    tooltipArray[0] = {label: t('c.relatedTime'), unixTime: t('nm.sta.Unknown')}
  }  

  const RenewNameButton = () => {
    if (isRenewable(status)) {
      if (type === 'readonly') {
        return (
          <button type="button" disabled className="btn-plain btn-sub ms-2">
            <Calendar2Plus />
          </button>
        )
      } else {
        return (
          <OverlayTrigger placement="top" overlay={
            <Tooltip>{t('tb.td.tips.renew', {label: label})}</Tooltip>
          }>
            <button type="button" className="btn-plain btn-sub ms-2" onClick={()=>setModalShow(true)}>
              <Calendar2Plus />
            </button>
          </OverlayTrigger>          
        )
      }
    } 
    return null
  }

  const NameAge = () => {
    if (status === 'Normal') {
      return (
        <span className="name-age">{ moment.unix(expiresTime)?.diff(moment(), 'years') }</span>
      )
    }
    return null
  }

  return (
    <>
      <OverlayTrigger placement="top" overlay={
          <Tooltip>
            { 
              jsonSortByNumber(tooltipArray, "unixTime").map((item, index) => {
                return (
                  <p key={index} className={'d-flex justify-content-between current-' + item.current ?? 'false'}>
                    <span className="tooltip-time-title me-1">{item.label}:</span>
                    <span className="tooltip-time-text">
                    {
                      typeof item.unixTime === "number" 
                      ? (
                          item.current 
                          ? <Clock format={'YYYY-MM-DD HH:mm:ss'} ticking={true} />
                          : moment.unix(item.unixTime).format('YYYY-MM-DD HH:mm:ss')
                        )
                      : item.unixTime
                    }
                    </span>
                  </p>
                )
              }) 
            }
          </Tooltip>
        }>        
        <span className={'td-status status-' + status + graceEndingClass + premiumEndingClass} onClick={()=>updateName(index)}>
          {t('nm.sta.' + status)}
          <NameAge />
        </span>
      </OverlayTrigger>
      <RenewNameButton />
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
    </>
  )
}

export const RegisterCell = (props) => {
  const { 
    label, 
    status, 
    defaultDuration, 
    registerName, 
    regStep, 
    estimateCost, 
    registerNameEnd, 
    regMsges, 
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
            disabled={type==='readonly'}
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
          t={t} 
        />
      </div>
    )
  }

  // if (status === 'Booked') {
  //   return (
  //     <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
  //       <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.cbook')}</Tooltip>}>
  //         <button type="button" id={"register-btn-" + label} className="btn-plain"
  //           disabled={false}
  //           onClick={()=>{cancelBook(index)}}
  //         >
  //           {t('c.cancel')}
  //         </button>
  //       </OverlayTrigger>
  //       <button 
  //         type="button" 
  //         id={"reg-sub-btn-" + label} 
  //         className="btn-plain btn-sub book-waiting ms-2" 
  //         title={t('tb.td.tips.booked')}>
  //         <Robot />
  //       </button>
  //     </div>
  //   )
  // }

  if (status === 'Unknown') {
    return (
      <div id={"trigger-unknown-" + label} className="btn-group" role="group" aria-label="Unknown">
        <button type="button" className="btn-plain" disabled={true}>
          {t('nm.sta.Unknown')}
        </button>
      </div>
    )
  }

  return (
    <div id={"trigger-reged-" + label} className="btn-group" role="group" aria-label="RegisterName">
      <button type="button" className="btn-plain" disabled={true}>
        {t('tb.td.reged')}
      </button>
    </div>
  )
}

export const LookupCell = (props) => {
  const { conf, label, tokenId, network } = props

  // for td-lookup
  const { lookup } = conf.custom.display
  // When you modify lookupLinks, you also need to modify:
  // 1. the custom.display.lookup filed of conf.json
  // 2. the nm.tb.lookup filed of en.json and cn.json
  const lookupLinks = {
    "Etherscan": "https://" + (network === "ropsten" ? "ropsten." : "") + "etherscan.io/enslookup-search?search=" + label + ".eth",
    "Opensea": `https://opensea.io/assets/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/${tokenId}`,
    "Metadata": `https://metadata.ens.domains/${network}/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/${tokenId}`,
    "eth.link": `https://${label}.eth.link/`,
    "DNSRelated": `https://domains.google.com/registrar/search?tab=1&searchTerm=${label}`
  }

  return (
    Object.keys(lookupLinks).map(item => 
      lookup[item]
      ? (
        <OverlayTrigger key={'lookup-key-' + item} placement="top" overlay={<Tooltip>{t('tb.lookup.' + item, {label: label})}</Tooltip>}>
          <a href={lookupLinks[item]} className={'me-1 text-center lookup-' + item} target="_blank" rel="noreferrer">{item.slice(0, 1)}</a>  
        </OverlayTrigger>
      )
      : null
    )
  )
}

export const DelCell = (props) => {
  const { label, removeName, index } = props

  return (
    <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.del', {label: label})}</Tooltip>}>
      <button type="button" className="btn-plain btn-sub" onClick={()=>removeName(index)}>
        <XCircle />
      </button>
    </OverlayTrigger>
  )
}