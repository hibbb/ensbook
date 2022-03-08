// import React from 'react';
// import { t } from 'i18next';

// const RegisterNamesConfirmModal = (props) => {
//   const { registerNames } = props
//   return (
//     <div className="modal fade" id="registerNamesConfirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="registerNamesConfirmModalLabel" aria-hidden="true">
//       <div className="modal-dialog">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="registerNamesConfirmModalLabel">{ t('modal.title') }</h5>
//             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div className="modal-body">
//             { t('modal.regAll') }
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{ t('c.cancel') }</button>
//             <button type="button" className="btn btn-primary"  data-bs-dismiss="modal" 
//             onClick={()=>registerNames()}>{ t('c.confirm') }</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default RegisterNamesConfirmModal


import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl, Col, Row, Spinner } from 'react-bootstrap';
import { ChevronCompactRight, CheckCircleFill, XCircleFill, CalendarWeek, DashCircleFill } from 'react-bootstrap-icons';
import moment from 'moment';
import { t } from 'i18next';


const RegisterNamesConfirmModal = (props) => {
  const { 
    show, 
    onHide, 
    registerNames, 
    registerNamesEnd,
    defaultDuration, 
    regMsges,
    regsMsges
  } = props

  
  const regAction = regMsges[0].text  // regBefore, regStarted, regSucceeded, regFailed, regSuspended
  const regsAction = regsMsges[0].text   // regsBefore, regsStarted, regsEnded

  const [duration, setDuration] = useState(defaultDuration) // duration: as Years

  const handleChange = (event) => {
    const { value } = event.target
    const newDuration = value
    setDuration(newDuration)
  }

  const ActionButton = () => {
    function regsEnd() {
      onHide()
      registerNamesEnd()
    }

    if (regsAction === 'regsStarted') {
      return (
        <Button variant="secondary" disabled>
          {t('nm.sta.Registering')}
          <Spinner animation="border" variant="light" className="ms-2 spinner-registering" />
        </Button>
      )
    }

    if (regsAction === 'regsEnded') {
      return <Button variant="primary" onClick={()=>regsEnd()}>{t('c.end')}</Button>
    }

    return (
      <>
        <Button variant="secondary" onClick={onHide}>{t('c.cancel')}</Button>
        <Button variant="primary" onClick={()=>{
            registerNames(moment.duration(duration, 'years').asSeconds())
          }
        }>{t('c.confirm')}</Button>
      </>
    )
  }

  const RegActionMsgIcon = () => {
    if (regAction === 'regSucceeded') {
      return (
        <span className="modal-message-text">
          <CheckCircleFill className="modal-message-icon reg-succeeded" />
        </span>
      )
    } else if (regAction === 'regFailed') {
      return (
        <span className="modal-message-text">
          <XCircleFill className="modal-message-icon reg-failed" />
        </span>
      )
    } else if (regAction === 'regSuspended') {
      return (
        <span className="modal-message-text">
          <DashCircleFill className="modal-message-icon reg-suspend" />
        </span>
      )
    } else {
      return null
    }
  }
  
  const RegActionMsg = () => {
    if (regAction === 'regBefore' || regAction === 'regStarted') {
      return null
    }
    return (
      <p className={"modal-message message-action"}>
        <span className="modal-message-time" title={regMsges[0].time.fromNow()}>
          {regMsges[0].time.format('HH:mm:ss')}
        </span>
        <ChevronCompactRight className="modal-message-icon" />
        <RegActionMsgIcon />
      </p>
    )
  }

  const RegInfoMsges = () => {
    return (
      regMsges.slice(1).map((message, index) => { 
        return (
          <p key={index} className={"modal-message message-" + message.type}>
            <span className="modal-message-time" title={message.time.fromNow()}>
              {message.time.format('HH:mm:ss')}
            </span>
            <ChevronCompactRight className="modal-message-icon" />
            <span className="modal-message-text" dangerouslySetInnerHTML={{ __html: message.text }} />
          </p>
        )
      })
    )
  }

  const RegsInfoMsges = () => {
    return (
      regsMsges.slice(1).map((message, index) => { 
        return (
          <p key={index} className={"modal-message message-" + message.type}>
            <span className="modal-message-time" title={message.time.fromNow()}>
              {message.time.format('HH:mm:ss')}
            </span>
            <ChevronCompactRight className="modal-message-icon" />
            {
              message.type === 'succeeded'
                ? <CheckCircleFill className="me-2 modal-message-icon reg-succeeded" />
                : null
            }
            {
              message.type === 'failed'
                ? <XCircleFill className="me-2 modal-message-icon reg-failed" /> 
                : null
            }
            { message.text }
          </p>
        )
      })
    )
  }

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>{ t('modal.regs.title') }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="modal-tip">
          {t('modal.regs.tip')}
        </p>
        <div className="mb-3 duration-input">
          <Row>
            <Col sm="9">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>{t('c.name')}: </InputGroup.Text>
                <FormControl className="modal-name-label" value="Bunch of Names" disabled />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="9">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>{t('c.duration')}: </InputGroup.Text>
                <FormControl value={duration} 
                  onChange={handleChange} 
                  disabled={ !(regAction === "regBefore" || regAction === "regSuspended") } 
                />
                <InputGroup.Text>{t('c.years')}</InputGroup.Text>
                <InputGroup.Text className="ms-2 until-time">
                  <CalendarWeek className="me-2" />
                  { moment().add(moment.duration(duration, 'years').asSeconds(), 'seconds').format('L') } 
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>
        <RegsInfoMsges />
        <RegInfoMsges />
        <RegActionMsg />
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />    
      </Modal.Footer>
    </Modal>
  )
}

export default RegisterNamesConfirmModal
