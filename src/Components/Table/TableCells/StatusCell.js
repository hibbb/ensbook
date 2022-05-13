import React from 'react';
import moment from 'moment';
import Clock from 'react-live-clock';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { t } from 'i18next';


export const StatusCell = (props) => {
  const { 
    label, 
    status, 
    registrationTime, 
    releaseTime, 
    expiresTime, 
    updateNames, 
    priceRange 
  } = props

  const graceEndingFlag = (
    status === 'Grace' 
    && moment().add(7, 'days').isAfter(moment.unix(releaseTime))
  )
  const graceEndingClass = graceEndingFlag ? ' grace-ending' : ''
  
  const premiumEndingFlag = (
    // Prepared for EP9
    status === 'Premium' 
    && priceRange < 21 
    && moment().isAfter(moment.unix(releaseTime).add(priceRange, 'days'))
  )
  const premiumEndingClass = premiumEndingFlag ? ' premium-ending' : ''

  const jsonSortByNumber = (array, key) => {
    if (array.length < 2 || !key || typeof array[0] !== "object" || typeof array[0][key] !== "number") {
      return array
    }
    array.sort(function(x, y) {return x[key] - y[key]})
    return array
  }

  let tooltipArray = []

  if (expiresTime > 0) {
    switch(status) {
      case 'Normal':
      case 'Grace':
        tooltipArray[0] = {label: t('c.registrationTime'), unixTime: registrationTime}
        tooltipArray[1] = {label: t('c.expiresTime'), unixTime: expiresTime}
        tooltipArray[2] = {label: t('c.releaseTime'), unixTime: releaseTime}
        tooltipArray[3] = {label: t('c.currentTime'), unixTime: moment().unix(), current: true}
        break
      case 'Premium':
      case 'Reopen':
        tooltipArray[0] = {label: t('c.registrationTime'), unixTime: registrationTime}
        tooltipArray[1] = {label: t('c.expiresTime'), unixTime: expiresTime}
        tooltipArray[2] = {label: t('c.releaseTime'), unixTime: releaseTime}
        tooltipArray[3] = {label: t('c.premiumEnd'), unixTime: releaseTime + moment.duration(21, 'days').asSeconds()}
        tooltipArray[4] = {label: t('c.currentTime'), unixTime: moment().unix(), current: true}
        break
      default:
        tooltipArray[0] = {label: t('c.relatedTime'), unixTime: t('nm.sta.Unknown')}
    }  
  } else {
    tooltipArray[0] = {label: t('c.relatedTime'), unixTime: t('nm.sta.Unknown')}
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
        <span className={'td-status status-' + status + graceEndingClass + premiumEndingClass} onClick={()=>updateNames([label])}>
          {t('nm.sta.' + status)}
          <NameAge />
        </span>
      </OverlayTrigger>
    </>
  )
}
