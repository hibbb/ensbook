import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl, Col, Row, Spinner } from 'react-bootstrap';
import { ChevronCompactRight, CheckCircleFill, XCircleFill, CalendarWeek, DashCircleFill } from 'react-bootstrap-icons';
import moment from 'moment';
import { t } from 'i18next';
import { getRegInfo } from '../Global/globals';


const RegisterNameConfirmModal = (props) => {
  const { 
    show, 
    onHide, 
    label, 
    registerName, 
    regStep, 
    defaultDuration, 
    registerNameEnd, 
    messages
  } = props

  // support fetching the setted duration from its regInfo
  const durationFromRegInfo = getRegInfo(label)?.duration
  const adjustDuration = durationFromRegInfo
    ? moment.duration(durationFromRegInfo, 'seconds').asYears().toFixed(2)
    : defaultDuration

  const action = messages[0].text  // regBefore, regStarted, regSucceeded, regFailed or regSuspended

  const [duration, setDuration] = useState(adjustDuration) // duration: as Years

  const handleChange = (event) => {
    const { value } = event.target
    const newDuration = value
    setDuration(newDuration)
  }

  const ActionButton = () => {
    function regFinished () {
      onHide()
      registerNameEnd(label)
    }

    if (action === 'regStarted') {
      return (
        <Button variant="secondary" disabled>
          {t('nm.sta.Registering')}
          <Spinner animation="border" variant="light" className="ms-2 spinner-registering" />
        </Button>
      )
    }
    if (action === 'regFailed' || action === 'regSucceeded') {
      return <Button variant="primary" onClick={()=>regFinished()}>{t('c.finish')}</Button>
    }
    if (action === 'regSuspended') {
      return (
        <>
          <Button variant="secondary" onClick={()=>regFinished()}>{t('c.cancel')}</Button>
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

  const ActionMessageIcon = () => {
    if (action === 'regSucceeded') {
      return (
        <span className="modal-message-text">
          <CheckCircleFill className="modal-message-icon reg-succeeded" />
        </span>
      )
    } else if (action === 'regFailed') {
      return (
        <span className="modal-message-text">
          <XCircleFill className="modal-message-icon reg-failed" />
        </span>
      )
    } else if (action === 'regSuspended') {
      return (
        <span className="modal-message-text">
          <DashCircleFill className="modal-message-icon reg-suspend" />
        </span>
      )
    }
    return null
  }
  
  const ActionMessage = () => {
    if (action === 'regBefore' || action === 'regStarted') {
      return null
    }
    return (
      <p className={"modal-message message-action"}>
        <span className="modal-message-time" title={messages[0].time.fromNow()}>
          {messages[0].time.format('HH:mm:ss')}
        </span>
        <ChevronCompactRight className="modal-message-icon" />
        <ActionMessageIcon />
      </p>
    )
  }

  const InfoMessage = (props) => {
    const { message } = props
    return (
      <p className={"modal-message message-" + message.type}>
        <span className="modal-message-time" title={message.time.fromNow()}>
          {message.time.format('HH:mm:ss')}
        </span>
        <ChevronCompactRight className="modal-message-icon" />
        <span className="modal-message-text" dangerouslySetInnerHTML={{ __html: message.text }} />
      </p>
    )
  }

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header>
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
                  disabled={ !(action === "regBefore" || action === "regSuspended") } 
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
        { messages.slice(1).map((item, index) => { return <InfoMessage key={index} message={item} /> }) }
        <ActionMessage />
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />    
      </Modal.Footer>
    </Modal>
  )
}

export default RegisterNameConfirmModal
