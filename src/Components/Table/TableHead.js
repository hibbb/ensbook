import React, { useState } from 'react';
import { utils } from 'ethers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { XCircle, Calculator, ChevronBarContract, ChevronBarExpand, ArrowRepeat } from 'react-bootstrap-icons';
import { t } from 'i18next';
import RegistrationsModal from '../Utils/RegistrationsModal';
import RemovalsModal from '../Utils/RemovalsModal';
import TooltipEstimateCost from './TooltipEstimateCost';
import { haveUnregistrableNames, isCustomWallet } from '../Global/globals';
import RenewalsModal from '../Utils/RenewalsModal';

let ascFlag = {
  "label": true,
  "level": false,
  "expiresTime": true,
  "releaseTime": true,
  "status": true
}

export const TableHead = (props) => {
  const { 
    type, 
    reconnecting, 
    nameInfo, 
    setAndStoreNameInfo, 
    conf,
    updateNames, 
    registerNames, 
    registerNamesEnd,
    regList,
    clearRegList,
    renewNames,
    renewNamesEnd,
    renewList,
    clearRenewList,
    defaultDuration,
    hideNames, 
    switchHideFlag, 
    removeNames, 
    estimateCosts, 
    regMsges,
    regsMsges,
    renewsMsges,
    getDefaultNameReceiver
  } = props

  const [regNamesModalShow, setRegNamesModalShow] = useState(false)
  const [renewNamesModalShow, setRenewNamesModalShow] = useState(false)

  const isBulkReg = () => regList.length > 0
  const isBulkRenew = () => renewList.length > 0

  const jsonSort = (array, key) => {
    if(array.length < 2 || !key || typeof array[0] !== "object") return array
    if(typeof array[0][key] === "number") {
      ascFlag[key]
      ? array.sort(function(x, y) {return x[key] - y[key]})
      : array.sort(function(x, y) {return y[key] - x[key]})
    }
    if(typeof array[0][key] === "string") {
      ascFlag[key]
      ? array.sort(function(x, y) {return x[key].localeCompare(y[key])})
      : array.sort(function(x, y) {return y[key].localeCompare(x[key])})
    }
    displaySortArrow(key)
    ascFlag[key] = !ascFlag[key]
    return array;
  }

  const displaySortArrow = (key) => {
    let thSpans = document.getElementsByClassName("th-sortable")
    for (let i = 0; i < thSpans.length; i++) {
      thSpans[i].classList.remove("sort-asc-true", "sort-asc-false");
    }
    let displaySpan = document.getElementById("th-" + key)
    displaySpan.classList.add("sort-asc-" + ascFlag[key])
  }

  const RegNamesButton = () => {
    return !isCustomWallet(conf) || reconnecting || !isBulkReg()
      ? (
        <button type="button" className="btn-plain btn-bulk-reg" disabled>
          {t('tb.th.reg')}
        </button>
      )
      : (
        <>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.regAll')}</Tooltip>}>
            <button
              type="button" 
              className={"btn-plain btn-bulk-reg " + (isBulkReg() ? "is-bulk-reg" : "")}
              onClick={()=>setRegNamesModalShow(true)} 
              >
              {t('tb.th.reg')}
            </button>
          </OverlayTrigger>
        </>
      )
  }

  const RenewNamesButton = () => {
    return type === 'readonly' || reconnecting || !isBulkRenew()
      ? (
          <button type="button" className="btn-plain btn-bulk-renew" disabled>
            {t('tb.th.renew')}
          </button>
      )
      : (
        <>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.renew')}</Tooltip>}>
            <button
              type="button" 
              className={"btn-plain btn-bulk-renew " + (isBulkRenew() ? "is-bulk-renew" : "")}
              disabled={ reconnecting || !isBulkRenew() }
              onClick={()=>setRenewNamesModalShow(true)}  
              >
              {t('tb.th.renew')}
            </button>
          </OverlayTrigger>
        </>
      )
  }

  const HideShowButton = () => {
    if (haveUnregistrableNames(nameInfo)) {
      return (
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.hideNames.' + (hideNames ? 'show' : 'hide'))}</Tooltip>}>
          <button type="button" className="btn-plain btn-sub ms-2" 
            onClick={()=>switchHideFlag()}
          >
            { hideNames ? <ChevronBarExpand /> : <ChevronBarContract /> }
          </button>
        </OverlayTrigger>
      )
    }
    return null
  }

  const initialEstimating = { 
    title: "tb.th.tips.estAll", 
    status: "before", 
    cost: "" 
  }
  const [estimating, setEstimating] = useState(initialEstimating);

  const estimateThese = async () => {
    setEstimating({ ...initialEstimating, status: "in" })
    const costEther = utils.formatEther(await estimateCosts(regList))
    setEstimating({ ...initialEstimating, status: "after", cost: costEther })
  }

  return (
    <thead>
      <tr className="ebr-tb-row">
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.no')}</Tooltip>}>
            <span id="th-level" className="th-sortable" 
              onClick={()=>setAndStoreNameInfo(jsonSort(nameInfo, "level"))}
            >
              {t('tb.th.no')}
            </span>
          </OverlayTrigger>
        </th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.lb')}</Tooltip>}>
            <span id="th-label" className="th-sortable" 
              onClick={()=>setAndStoreNameInfo(jsonSort(nameInfo, "label"))}
            >
              {t('tb.th.lb')}
            </span>
          </OverlayTrigger>
        </th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.sta')}</Tooltip>}>
            <span id="th-expiresTime" className="th-sortable"
              onClick={()=>setAndStoreNameInfo(jsonSort(nameInfo, "expiresTime"))}
            >
              {t('tb.th.sta')}
            </span>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.update')}</Tooltip>}>
            <button type="button" className="btn-plain ms-2" 
              onClick={()=>updateNames()}
            >
              <ArrowRepeat />
            </button>
          </OverlayTrigger>
        </th>
        <th>
          <RegNamesButton />
          <RegistrationsModal 
            show={regNamesModalShow}
            onHide={()=>setRegNamesModalShow(false)}
            registerNames={registerNames}
            registerNamesEnd={registerNamesEnd}
            regList={regList}
            clearRegList={clearRegList}
            defaultDuration={defaultDuration}
            regMsges={regMsges}
            regsMsges={regsMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
          <OverlayTrigger placement="top" overlay={
            <Tooltip>
              <TooltipEstimateCost estimating={estimating} />
            </Tooltip>
          }>
            <button type="button" id="btn-estimate-all" className="btn-plain btn-sub ms-2" 
              onClick={()=>estimateThese()} disabled={!isBulkReg()}
            >
              <Calculator />
            </button>
          </OverlayTrigger>
          <HideShowButton />
        </th>
        <th>
          <RenewNamesButton />
          <RenewalsModal
            show={renewNamesModalShow}
            onHide={()=>setRenewNamesModalShow(false)}
            renewNames={renewNames}
            renewNamesEnd={renewNamesEnd}
            renewList={renewList}
            clearRenewList={clearRenewList}
            defaultDuration={defaultDuration}
            renewsMsges={renewsMsges}
          />
        </th>
        <th>{t('tb.th.lu')}</th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.remAll')}</Tooltip>}>
            <button type="button" className="btn-plain btn-del-name" 
              data-bs-toggle="modal" 
              data-bs-target="#removeNamesConfirmModal"
            >
              <XCircle />
            </button>
          </OverlayTrigger>
          <RemovalsModal removeNames={removeNames} />
        </th>
      </tr>
    </thead>
  )
}