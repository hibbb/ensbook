import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './Utils/RegisterConfirmModal';
import RegisterConfirmModal from './Utils/RegisterConfirmModal';
import moment from 'moment'
import { BoxArrowUpRight, XCircle, Calculator, Robot } from 'react-bootstrap-icons';

let ascFlag = {
  "label": true,
  "level": false,
  "expiresTime": true,
  "releaseTime": true,
  "status": true
}

const TableHeader = (props) => {
  const {nameInfo, timeDisplay, setAndStoreNameInfo, t} = props

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

  return (
    <thead>
      <tr className="ebr-tb-row">
        <th>
          <span id="th-level" className="th-sortable" 
            onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "level"))}}
          >
            {t('tb.th.no')}
          </span>
        </th>
        <th>
          <span id="th-label" className="th-sortable" 
            onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "label"))}}
          >
            {t('tb.th.lb')}
          </span>
        </th>
        <th>{t('tb.th.lu')}</th>
        <th>
          <span id={"th-" + timeDisplay} className="th-sortable"
            onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, timeDisplay))}}
          >
            {t('c.' + timeDisplay)}
          </span>
        </th>
        <th>
          <span id="th-status" className="th-sortable"
            onClick={()=>{setAndStoreNameInfo(jsonSort(nameInfo, "status"))}}
          >
            {t('tb.th.sta')}
          </span>
        </th>
        <th>{t('tb.th.reg')}</th>
        <th>{t('tb.th.del')}</th>
      </tr>
    </thead>
  )
}

const TableBody = (props) => {
  const {conf, t} = props
  const rows = props.nameInfo.map((row, index) => {
    // for td-label
    const nameLink = "https://app.ens.domains/name/" + row.label + ".eth"
    let labelClickCount = 0
    const oneClickToLevelUp = () => {
      labelClickCount += 1;
      setTimeout(() => {
        if (labelClickCount === 1) {
          props.levelUp(index)
        }
        labelClickCount = 0;
      }, 350);
    }
    
    // for td-lookup
    const { lookup } = conf.custom.display
    // When you modify lookupLinks, you also need to modify:
    // 1. the custom.display.lookup filed of conf.json
    // 2. the nm.tb.lookup filed of en.json and cn.json
    const lookupLinks = {
      "Etherscan": "https://" + (conf.custom.network === "ropsten" ? "ropsten." : "") + "etherscan.io/enslookup-search?search=" + row.label + ".eth",
      "Opensea": "https://opensea.io/assets/" + conf.fixed.contract.addr[conf.custom.network].BaseRegImp + "/" + row.tokenId,
      "Metadata": "https://metadata.ens.domains/" + conf.custom.network + "/" + conf.fixed.contract.addr[conf.custom.network].BaseRegImp + "/" + row.tokenId,
      "eth.link": "https://" + row.label + ".eth.link/",
      "DNSRelated": "https://domains.google.com/registrar/search?tab=1&searchTerm=" + row.label
    }

    // for expiresTime or releaseTime
    const displayTime = conf.custom.display.time === 'expiresTime' ? moment.unix(row.expiresTime) : moment.unix(row.releaseTime)
    let readableTime, accurateTime

    // for td-status
    switch(row.status) {
      case 'Open':
        readableTime = row.expiresTime    // 0
        accurateTime = row.expiresTime
        break
      case 'Normal':
        readableTime = displayTime.format('YYYY-MM-DD')
        accurateTime = displayTime.format('YYYY-MM-DD HH:mm:ss')
        break
      case 'Grace':
      case 'Booked': 
      case 'Premium':
      case 'Reopen':
        readableTime = displayTime.fromNow()
        accurateTime = displayTime.format('YYYY-MM-DD HH:mm:ss')
        break
      default:
        readableTime = t('nm.sta.Unknown')
    } 

    
    return (
      <tr key={index} className='ebr-tb-row'>
        <td>{index + 1}</td>
        <td className='td-name-label'>
          <span className={'td-level td-level-' + row.level} 
            onClick={()=>oneClickToLevelUp()}
          >
            {row.label}
          </span> 
          <OverlayTrigger
            key={'name-label-' + row.label}
            placement="top"
            overlay={
              <Tooltip id={'tooltip-name-label-' + row.label}>
                ENS APP
              </Tooltip>
            }>
            <a href={nameLink} target="_blank" rel="noreferrer">
              <BoxArrowUpRight className="external-link-icon" />
            </a>
          </OverlayTrigger>
        </td>
        <td className='td-lookup'>
          {Object.keys(lookupLinks).map(item => 
            lookup[item]
            ? (<OverlayTrigger
                key={'lookup-' + item}
                placement="top"
                overlay={
                  <Tooltip id={'tooltip-' + item + '-' + row.label}>
                    {t('tb.lookup.' + item)}
                  </Tooltip>
                }>
                  <a href={lookupLinks[item]} className={'me-1 text-center lookup-' + item} target="_blank" rel="noreferrer">{item.slice(0, 1)}</a>  
              </OverlayTrigger>)
            : null
          )}
        </td>
        <td>
          <OverlayTrigger
            key={'displaytime-' + row.label}
            placement="top"
            overlay={
              <Tooltip id={'tooltip-displaytime-' + row.label}>
                {accurateTime}
              </Tooltip>
            }>
            <span>{readableTime}</span>
          </OverlayTrigger>
        </td>
        <td>
          <span className={'px-1 td-status status' + row.status} title={t('nm.staTit')}
            onClick={()=>{props.updateName(index)}}
          >
            {t('nm.sta.' + row.status)}
          </span>
        </td>
        <td>
          <SingleRegisterButton 
            status={row.status} 
            register={props.register} 
            label={row.label} 
            expiresTime={row.expiresTime}
            index={index}
            estimatePrice={props.estimatePrice}
            book={props.book}
            cancelBook={props.cancelBook}
            t={t}
          />
        </td>
        <td>
          <button type="button" className="btn-plain btn-del-name" 
            onClick={()=>props.removeName(index)}
          >
            <XCircle />
          </button>
        </td>
      </tr>
    )
  })
  
  return (
    <tbody>{rows}</tbody>
  )
}

const SingleRegisterButton = (props) => {
  const {status, register, label, expiresTime, index, estimatePrice, book, cancelBook, t} = props
  if (status === 'Open' || status === 'Reopen' || status === 'Premium') {
    return (
      <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
        <button
          type="button" 
          id={"register-btn-" + label}
          className="btn-plain btn-reg" 
          data-bs-toggle="modal" data-bs-target={"#registerConfirmModal-" + label}
          >
          {t('tb.btn.sgl.reg')}
        </button>
        <OverlayTrigger
          key={"estimate-" + label}
          placement="top"
          overlay={
            <Tooltip id={"tooltip-estimate-" + label}>
              {t('tb.btn.sgl.estTit')}
            </Tooltip>
          }
        >
          <button type="button" id={"reg-sub-btn" + label} className="btn-plain btn-reg-sub ms-2" 
            onClick={()=>{estimatePrice(label)}}
          >
            <Calculator />
          </button>
        </OverlayTrigger>
        <RegisterConfirmModal register={register} label={label} t={t} />
      </div>
    )
  }

  const expiresTimeMilli = moment.unix(expiresTime)
  const nowT = moment()
  const bookActiveDurationFlag = nowT.add(24, 'hours') > expiresTimeMilli.add(90, 'days')

  if (status === 'Grace' && bookActiveDurationFlag) {
    return (
      <div id={"register-" + label} className="btn-group" role="group" aria-label="Register or Estimate Price">
        <button 
          type="button" 
          id={"register-btn-" + label}
          className="btn-plain btn-book" 
          data-bs-toggle="modal" data-bs-target={"#registerConfirmModal-" + label}
          >
          {t('tb.btn.sgl.book')}
        </button>
        <button type="button" id={"reg-sub-btn" + label} className="btn-plain btn-reg-sub ms-2"></button>
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
          {t('tb.btn.sgl.reg')}
        </button>
        <button 
          type="button" 
          id={"reg-sub-btn" + label} 
          className="btn-plain btn-reg-sub ms-2" 
          title={t('tb.btn.sgl.regingTit')}>
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
        <button type="button" id={"register-btn-" + label} className="btn-plain"
          disabled={false}
          onClick={()=>{cancelBook(index)}}
        >
          {t('c.cancel')}
        </button>
        <button 
          type="button" 
          id={"reg-sub-btn" + label} 
          className="btn-plain btn-reg-sub book-waiting ms-2" 
          title={t('tb.btn.sgl.bookTit')}>
          <Robot />
        </button>
      </div>
    )
  }

  return (
    <div id={"register-" + label} className="btn-group" role="group" aria-label="Register">
      <button 
        type="button" 
        className="btn-plain" 
        disabled={true}>
        {t('tb.btn.sgl.reg')}
      </button>
    </div>
  )
}

class NamesDisplayTable extends React.Component {
  componentDidMount() {
    this.props.updateNames(false)
  }

  render() {
    return (
      <table className="table table-hover ebr-tb">
        <TableHeader
          nameInfo={this.props.nameInfo}
          timeDisplay={this.props.conf.custom.display.time}
          setAndStoreNameInfo={this.props.setAndStoreNameInfo}
          t={this.props.t}
        />
        <TableBody 
          nameInfo={this.props.nameInfo} 
          conf={this.props.conf}
          levelUp={this.props.levelUp}
          updateName={this.props.updateName}
          register={this.props.register} 
          removeName={this.props.removeName} 
          estimatePrice={this.props.estimatePrice} 
          book={this.props.book}
          cancelBook={this.props.cancelBook}
          t={this.props.t}
        />
      </table>
    )
  }
}

export default NamesDisplayTable