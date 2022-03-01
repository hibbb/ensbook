import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { XCircle, Calculator, ChevronBarContract, ChevronBarExpand, ArrowRepeat, Calendar2Plus } from 'react-bootstrap-icons';
import RegisterAllConfirmModal from '../Utils/RegisterAllConfirmModal';
import RemoveNamesConfirmModal from '../Utils/RemoveNamesConfirmModal';

let ascFlag = {
  "label": true,
  "level": false,
  "expiresTime": true,
  "releaseTime": true,
  "status": true
}

export const TableHead = (props) => {
  const { 
    nameInfo, 
    setAndStoreNameInfo, 
    updateNames, 
    isRenewable, 
    registerAll, 
    isRegistrable, 
    hideNames, 
    switchHideFlag, 
    removeNames, 
    estimateCosts, 
    t 
  } = props

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

  const RenewNamesButton = () => {
    const haveRenewableName = nameInfo.findIndex(row => isRenewable(row.status)) >= 0
    if (haveRenewableName) return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.renew')}</Tooltip>}>
        <button type="button" className="btn-plain btn-sub ms-2"
          onClick={null}
        >
          <Calendar2Plus />
        </button>
      </OverlayTrigger>
    )
    return null 
  }

  const HideShowButton = () => {
    const haveUnregistrableName = nameInfo.findIndex(row => !isRegistrable(row.status)) >= 0
    if (haveUnregistrableName) return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.hideNames.' + (hideNames ? 'show' : 'hide'))}</Tooltip>}>
        <button type="button" className="btn-plain btn-sub ms-2" 
          onClick={switchHideFlag}
        >
          { hideNames ? <ChevronBarExpand /> : <ChevronBarContract /> }
        </button>
      </OverlayTrigger>
    )
    return null
  }

  return (
    <thead>
      <tr className="ebr-tb-row">
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.no')}</Tooltip>}>
            <span id="th-level" className="th-sortable" 
              onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "level"))}}
            >
              {t('tb.th.no')}
            </span>
          </OverlayTrigger>
        </th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.lb')}</Tooltip>}>
            <span id="th-label" className="th-sortable" 
              onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "label"))}}
            >
              {t('tb.th.lb')}
            </span>
          </OverlayTrigger>
        </th>
        <th>{t('tb.th.lu')}</th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.sta')}</Tooltip>}>
            <span id="th-expiresTime" className="th-sortable"
              onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "expiresTime"))}}
            >
              {t('tb.th.sta')}
            </span>
          </OverlayTrigger>
          <RenewNamesButton />
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.update')}</Tooltip>}>
            <button type="button" className="btn-plain ms-2" 
              onClick={updateNames}
            >
              <ArrowRepeat />
            </button>
          </OverlayTrigger>
        </th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.regAll')}</Tooltip>}>
            <button
              type="button" 
              className="btn-plain btn-reg" 
              data-bs-toggle="modal" 
              data-bs-target="#registerAllConfirmModal"
              >
              {t('tb.th.reg')}
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.estAll')}</Tooltip>}>
            <button type="button" id="btn-estimate-all" className="btn-plain btn-sub ms-2" 
              onClick={estimateCosts}
            >
              <Calculator />
            </button>
          </OverlayTrigger>
          <HideShowButton />
          <RegisterAllConfirmModal registerAll={registerAll} t={t} />
        </th>
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.remAll')}</Tooltip>}>
            <button type="button" className="btn-plain btn-del-name" 
              data-bs-toggle="modal" 
              data-bs-target="#removeNamesConfirmModal"
            >
              <XCircle />
            </button>
          </OverlayTrigger>
          <RemoveNamesConfirmModal removeNames={removeNames}  t={t}/>
        </th>
      </tr>
    </thead>
  )
}