import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl, Col, Row, Spinner } from 'react-bootstrap';
import { ChevronCompactRight, CheckCircleFill, XCircleFill, CalendarWeek, DashCircleFill } from 'react-bootstrap-icons';
import moment from 'moment';
import { t } from 'i18next';
import { getRegInfo } from '../Global/globals';


const RegistrationModal = (props) => {
  const { 
    show, 
    onHide, 
    label, 
    registerName, 
    regStep, 
    defaultDuration, 
    registerNameEnd, 
    regMsges
  } = props

  // support fetching the setted duration from its regInfo
  const durationFromRegInfo = getRegInfo(label)?.duration
  const adjustDuration = durationFromRegInfo
    ? moment.duration(durationFromRegInfo, 'seconds').asYears().toFixed(2)
    : defaultDuration

  const regAction = regMsges[0].text  // regBefore, regStarted, regSucceeded, regFailed or regSuspended

  const [duration, setDuration] = useState(adjustDuration) // duration: as Years

  const handleChange = (event) => {
    const { value } = event.target
    const newDuration = value
    setDuration(newDuration)
  }

  const ActionButton = () => {
    function regEnd () {
      onHide()
      registerNameEnd(label)
    }

    if (regAction === 'regStarted') {
      return (
        <Button variant="secondary" disabled>
          {t('nm.sta.Registering')}
          <Spinner animation="border" variant="light" className="ms-2 spinner-acting" />
        </Button>
      )
    }
    if (regAction === 'regFailed' || regAction === 'regSucceeded') {
      return <Button variant="primary" onClick={()=>regEnd()}>{t('c.end')}</Button>
    }
    if (regAction === 'regSuspended') {
      return (
        <>
          <Button variant="secondary" onClick={()=>regEnd()}>{t('c.cancel')}</Button>
          <Button variant="primary" 
            onClick={()=>{registerName(
              label, 
              moment.duration(duration, 'years').asSeconds(),
              regStep
            )}
          }>{t('tb.td.continue')}</Button>
        </>
      )     
    }
    return (
      <>
        <Button variant="secondary" onClick={onHide}>{t('c.cancel')}</Button>
        <Button variant="primary" onClick={()=>{
          registerName(
            label, 
            moment.duration(duration, 'years').asSeconds(),
            regStep
          )}
        }>{t('c.confirm')}</Button>
      </>
    )
  }

  const RegActionMsgIcon = () => {
    if (regAction === 'regSucceeded') {
      return (
        <span className="modal-message-text">
          <CheckCircleFill className="me-2 modal-message-icon action-succeeded" />
          { label + '.eth' }
        </span>
      )
    } else if (regAction === 'regFailed') {
      return (
        <span className="modal-message-text">
          <XCircleFill className="me-2 modal-message-icon action-failed" /> 
          { label + '.eth' }
        </span>
      )
    } else if (regAction === 'regSuspended') {
      return (
        <span className="modal-message-text">
          <DashCircleFill className="me-2 modal-message-icon action-suspend" />
          { label + '.eth' }
        </span>
      )
    }
    return null
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

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{ t('modal.reg.title', { label: label}) }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="modal-tip">
          {t('modal.reg.tip')}
        </p>
        <div className="mb-3 duration-input">
          <Row>
            <Col sm="9">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>{t('c.name')}: </InputGroup.Text>
                <FormControl className="modal-name-label" value={label + '.eth'} disabled />
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
        <RegInfoMsges />
        <RegActionMsg />
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />    
      </Modal.Footer>
    </Modal>
  )
}

export default RegistrationModal
