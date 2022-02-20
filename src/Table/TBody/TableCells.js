import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import RegisterConfirmModal from '../../Utils/RegisterConfirmModal';
import moment from 'moment';
import Clock from 'react-live-clock';
import { BoxArrowUpRight, XCircle, Calculator, Robot, Calendar2Plus } from 'react-bootstrap-icons';
import { t } from 'i18next';


export const LabelCell = (props) => {
  const { label, level, index, nameInfo, setAndStoreNameInfo } = props
  // for td-label
  const nameLink = "https://app.ens.domains/name/" + label + ".eth"
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
        <span className={'td-level td-level-' + level} onClick={()=>oneClickToLevelUp()}>
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

export const LookupCell = (props) => {
  const {conf, label, tokenId, t} = props

  // for td-lookup
  const { lookup } = conf.custom.display
  // When you modify lookupLinks, you also need to modify:
  // 1. the custom.display.lookup filed of conf.json
  // 2. the nm.tb.lookup filed of en.json and cn.json
  const lookupLinks = {
    "Etherscan": "https://" + (conf.custom.network === "ropsten" ? "ropsten." : "") + "etherscan.io/enslookup-search?search=" + label + ".eth",
    "Opensea": "https://opensea.io/assets/" + conf.fixed.contract.addr[conf.custom.network].BaseRegImp + "/" + tokenId,
    "Metadata": "https://metadata.ens.domains/" + conf.custom.network + "/" + conf.fixed.contract.addr[conf.custom.network].BaseRegImp + "/" + tokenId,
    "eth.link": "https://" + label + ".eth.link/",
    "DNSRelated": "https://domains.google.com/registrar/search?tab=1&searchTerm=" + label
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

export const StatusCell = (props) => {
  const {label, index, status, releaseTime, expiresTime, updateName, isRenewable, t} = props

  const graceEndingFlag = status === 'Grace' && moment().add(18, 'days') > moment.unix(releaseTime)
  const graceEndingClass = graceEndingFlag ? ' grace-ending' : ''
  const premiumEndingFlag = status === 'Premium' && moment() > moment.unix(releaseTime).add(26, 'days')
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
      case 'Booked': 
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
    if (isRenewable(status)) return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.renew', {label: label})}</Tooltip>}>
        <button type="button" 
          id={"status-sub-btn-" + label} 
          className="btn-plain btn-sub ms-2" 
          onClick={null}
        >
          <Calendar2Plus />
        </button>
      </OverlayTrigger>
    )
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
        <span className={'px-1 td-status status' + status + graceEndingClass + premiumEndingClass} onClick={()=>{updateName(index)}}>
          {t('nm.sta.' + status)}
        </span>
      </OverlayTrigger>
      <RenewNameButton />
    </>
  )
}

export const RegisterCell = (props) => {
  const {status, register, label, expiresTime, index, estimatePrice, book, cancelBook, t} = props
  if (status === 'Open' || status === 'Reopen' || status === 'Premium') {
    return (
      <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.reg', {label: label})}</Tooltip>}>
          <button
            type="button" 
            id={"register-btn-" + label}
            className="btn-plain btn-reg" 
            data-bs-toggle="modal" data-bs-target={"#registerConfirmModal-" + label}
            >
            {t('tb.td.reg')}
          </button>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.est')}</Tooltip>}>
          <button type="button" id={"reg-sub-btn-" + label} className="btn-plain btn-sub ms-2" 
            onClick={()=>{estimatePrice(label)}}
          >
            <Calculator />
          </button>
        </OverlayTrigger>
        <RegisterConfirmModal register={register} label={label} t={t} />
      </div>
    )
  }

  //bookActiveDurationFlag: moment().add(24, 'hours') > moment.unix(expiresTime).add(90, 'days')
  if (status === 'Grace' && moment().add(24, 'hours') > moment.unix(expiresTime).add(90, 'days')) {
    return (
      <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.book', {label: label})}</Tooltip>}>
          <button 
            type="button" 
            id={"register-btn-" + label}
            className="btn-plain btn-book" 
            data-bs-toggle="modal" data-bs-target={"#registerConfirmModal-" + label}
            >
            {t('tb.td.book')}
          </button>
        </OverlayTrigger>
        <RegisterConfirmModal register={book} label={label} t={t} />
      </div>
    )
  }

  if (status === 'Registering') {
    return (
      <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
        <button 
          type="button" 
          id={"register-btn-" + label}
          className="btn-plain"
          disabled={true}
          >
          {t('tb.td.reg')}
        </button>
        <button 
          type="button" 
          id={"reg-sub-btn-" + label} 
          className="btn-plain btn-sub ms-2" 
          title={t('tb.td.tips.reging')}>
          <div className="spinner-border reg-waiting" role="status">
            <span className="visually-hidden">Registering...</span>
          </div>
        </button>
      </div>
    )
  }

  if (status === 'Booked') {
    return (
      <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.cbook')}</Tooltip>}>
          <button type="button" id={"register-btn-" + label} className="btn-plain"
            disabled={false}
            onClick={()=>{cancelBook(index)}}
          >
            {t('c.cancel')}
          </button>
        </OverlayTrigger>
        <button 
          type="button" 
          id={"reg-sub-btn-" + label} 
          className="btn-plain btn-sub book-waiting ms-2" 
          title={t('tb.td.tips.booked')}>
          <Robot />
        </button>
      </div>
    )
  }

  return (
    <div id={"trigger-reged-" + label} className="btn-group" role="group" aria-label="Register">
      <button type="button" className="btn-plain" disabled={true}>
        {t('tb.td.reged')}
      </button>
    </div>
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