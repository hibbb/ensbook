import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LabelCell, LookupCell, StatusCell, RegisterCell, DelCell } from './TBody/TableCells';
import RegisterAllConfirmModal from '../Utils/RegisterAllConfirmModal';
import RemoveNamesConfirmModal from '../Utils/RemoveNamesConfirmModal';
import { XCircle, Calculator, ChevronBarContract, ChevronBarExpand, ArrowRepeat, Calendar2Plus } from 'react-bootstrap-icons';

let ascFlag = {
  "label": true,
  "level": false,
  "expiresTime": true,
  "releaseTime": true,
  "status": true
}

let hideFlag = {
  hideButton: true,
  hideNames: false
}

const registrableStatuses = ['Open', 'Reopen', 'Premium']

const TableHeader = (props) => {
  const {nameInfo, setAndStoreNameInfo, t} = props

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

  const HideShowButton = () => {
    const haveUnregistrableName = nameInfo.findIndex(
      item => registrableStatuses.indexOf(item.status)
    )
    const hideUnregistrableNames = () => {
      hideFlag.hideNames = !hideFlag.hideNames
      setAndStoreNameInfo(nameInfo, false)
    }
    if (haveUnregistrableName < 0) {
      return null
    }
    
    return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.hideNames.' + (hideFlag.hideNames ? 'show' : 'hide'))}</Tooltip>}>
        <button type="button" className="btn-plain btn-sub ms-2" 
            onClick={hideUnregistrableNames}
          >
          { hideFlag.hideNames ? <ChevronBarExpand /> : <ChevronBarContract /> }
        </button>
      </OverlayTrigger>
    )  
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
        {/* <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.ti')}</Tooltip>}>
            <span id={"th-" + timeDisplay} className="th-sortable"
              onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, timeDisplay))}}
            >
              {t('c.' + timeDisplay)}
            </span>
          </OverlayTrigger>
        </th> */}
        <th>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.sta')}</Tooltip>}>
            <span id="th-expiresTime" className="th-sortable"
              onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "expiresTime"))}}
            >
              {t('tb.th.sta')}
            </span>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.renew')}</Tooltip>}>
            <button type="button" className="btn-plain btn-sub ms-2"
              onClick={null}
            >
              <Calendar2Plus />
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.th.tips.update')}</Tooltip>}>
            <button type="button" className="btn-plain ms-2" 
              onClick={props.updateNames}
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
              onClick={props.estimatePriceAll}
            >
              <Calculator />
            </button>
          </OverlayTrigger>
          <HideShowButton />
          <RegisterAllConfirmModal registerAll={props.registerAll} t={t} />
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
          <RemoveNamesConfirmModal removeNames={props.removeNames}  t={t}/>
        </th>
      </tr>
    </thead>
  )
}

const TableBody = (props) => {
  const {conf, levelUp, removeName, t} = props
  const rows = props.nameInfo.map((row, index) => {
    if (hideFlag.hideNames && registrableStatuses.indexOf(row.status) < 0) {
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
            levelUp={levelUp}
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
        {/* <td>
          <TimeCell
            label={row.label} 
            index={index}
            status={row.status} 
            displayTime={conf.custom.display.time}
            expiresTime={row.expiresTime}
            releaseTime={row.releaseTime}
            updateName={props.updateName}
            t={t}
          />
        </td> */}
        <td>
          <StatusCell
            label={row.label} 
            index={index}
            status={row.status} 
            expiresTime={row.expiresTime}
            releaseTime={row.releaseTime}
            updateName={props.updateName}
            t={t}
          />
        </td>
        <td>
          <RegisterCell 
            label={row.label} 
            index={index}
            status={row.status} 
            expiresTime={row.expiresTime}
            estimatePrice={props.estimatePrice}
            register={props.register} 
            book={props.book}
            cancelBook={props.cancelBook}
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

class NamesDisplayTable extends React.Component {
  componentDidMount() {
    this.props.updateNames(false)
  }

  render() {
    const { 
      nameInfo, 
      conf, 
      setAndStoreNameInfo, 
      levelUp, 
      updateName, 
      updateNames, 
      estimatePrice, 
      estimatePriceAll, 
      register, 
      registerAll, 
      book, 
      cancelBook, 
      removeNames, 
      removeName, 
      t
    } = this.props

    return (
      <table className="table table-hover ebr-tb">
        <TableHeader
          nameInfo={nameInfo}
          setAndStoreNameInfo={setAndStoreNameInfo}
          updateNames={updateNames}
          registerAll={registerAll}
          removeNames={removeNames}
          estimatePriceAll={estimatePriceAll}
          t={t}
        />
        <TableBody 
          nameInfo={nameInfo} 
          conf={conf}
          levelUp={levelUp}
          updateName={updateName}
          register={register} 
          removeName={removeName} 
          estimatePrice={estimatePrice} 
          book={book}
          cancelBook={cancelBook}
          t={t}
        />
      </table>
    )
  }
}

export default NamesDisplayTable