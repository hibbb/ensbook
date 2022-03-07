import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl, Col, Row, Spinner } from 'react-bootstrap';
import { ChevronCompactRight, CheckCircleFill, XCircleFill, CalendarWeek } from 'react-bootstrap-icons';
import moment from 'moment';
import { t } from 'i18next';


const RegisterNameConfirmModal = (props) => {
  const { 
    show, 
    onHide, 
    label, 
    registerName, 
    defaultDuration, 
    registerNameEnd, 
    messages
  } = props

  const action = messages[0].text
  const [duration, setDuration] = useState(defaultDuration) // duration: as Years

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
    return (
        <>
          <Button variant="secondary" onClick={onHide}>{t('c.cancel')}</Button>
          <Button variant="primary" onClick={()=>registerName(label, moment.duration(duration).asSeconds())}>{t('c.confirm')}</Button>
        </>
      )
  }
  
  const ActionMessage = (props) => {
    const { message } = props
    if (message.text !== 'regSucceeded' && message.text !== 'regFailed') {
      return null
    }
    return (
      <p className={"modal-message message-" + message.type}>
        <span className="modal-message-time">{message.time.format('HH:mm:ss')}</span>
        <ChevronCompactRight className="modal-message-icon" />
        {
          message.text === 'regSucceeded'
          ? <span className="modal-message-text">
              <CheckCircleFill className="modal-message-icon reg-succeeded" />
            </span>
          : <span className="modal-message-text">
              <XCircleFill className="modal-message-icon reg-failed" />
            </span>
        }
      </p>
    )
    
  }

  const MessageItem = (props) => {
    return (
      <p className={"modal-message message-" + props.message.type}>
        <span className="modal-message-time">{props.message.time.format('HH:mm:ss')}</span>
        <ChevronCompactRight className="modal-message-icon" />
        <span className="modal-message-text" dangerouslySetInnerHTML={{ __html: props.message.text }} />
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
                <FormControl value={duration} onChange={handleChange} disabled={action!=="actionBefore"} />
                <InputGroup.Text>{t('c.years')}</InputGroup.Text>
                <InputGroup.Text className="ms-2 until-time">
                  <CalendarWeek className="me-2" />
                  { moment().add(moment.duration(duration, 'years').asSeconds(), 'seconds').format('L') } 
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>
        { messages.slice(1).map((item, index) => <MessageItem key={index} message={item} />) }
        <ActionMessage message={messages[0]} />
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />    
      </Modal.Footer>
    </Modal>
  )
}

export default RegisterNameConfirmModal
