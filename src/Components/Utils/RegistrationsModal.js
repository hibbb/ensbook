import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl, Col, Row, Spinner } from 'react-bootstrap';
import { ChevronCompactRight, CheckCircleFill, XCircleFill, CalendarWeek, DashCircleFill } from 'react-bootstrap-icons';
import moment from 'moment';
import { t } from 'i18next';


const RegistrationsModal = (props) => {
  const { 
    show, 
    onHide, 
    registerNames, 
    registerNamesEnd,
    defaultDuration, 
    regMsges,
    regsMsges,
    getDefaultNameReceiver
  } = props

  
  const regAction = regMsges[0].text  // regBefore, regStarted, regSucceeded, regFailed, regSuspended
  const regsAction = regsMsges[0].text   // regsBefore, regsStarted, regsEnded

  const [duration, setDuration] = useState(defaultDuration) // duration: as Years

  const receiver = getDefaultNameReceiver()

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
          <Spinner animation="border" variant="light" className="ms-2 spinner-acting" />
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
            registerNames(moment.duration(duration, 'years').asSeconds(), receiver)
          }
        }>{t('c.confirm')}</Button>
      </>
    )
  }

  const RegActionMsgIcon = () => {
    if (regAction === 'regSucceeded') {
      return (
        <span className="modal-message-text">
          <CheckCircleFill className="modal-message-icon action-succeeded" />
        </span>
      )
    } else if (regAction === 'regFailed') {
      return (
        <span className="modal-message-text">
          <XCircleFill className="modal-message-icon action-failed" />
        </span>
      )
    } else if (regAction === 'regSuspended') {
      return (
        <span className="modal-message-text">
          <DashCircleFill className="modal-message-icon action-suspend" />
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
                ? <CheckCircleFill className="me-2 modal-message-icon action-succeeded" />
                : null
            }
            {
              message.type === 'failed'
                ? <XCircleFill className="me-2 modal-message-icon action-failed" /> 
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
                <FormControl className="modal-name-label" value={t('modal.regs.names')} disabled />
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
          <Row>
            <Col sm="9">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>{t('modal.reg.receiver')}: </InputGroup.Text>
                <FormControl 
                  value={receiver} 
                  disabled 
                />
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

export default RegistrationsModal
