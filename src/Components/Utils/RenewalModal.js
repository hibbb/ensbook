import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl, Col, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCircleCheck, faCircleXmark, faCalendarDays, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { t } from 'i18next';


const RenewalModal = (props) => {
  const { 
    show, 
    onHide, 
    label,
    expiresTime,
    renewName,
    renewNameEnd,
    defaultDuration, 
    renewMsges
  } = props

  // renewBefore, renewStarted, renewSucceeded, renewFailed, renewSuspended
  const renewAction = renewMsges[0].text  

  const [duration, setDuration] = useState(defaultDuration) // duration: as Years

  const handleChange = (event) => {
    const { value } = event.target
    const newDuration = value
    setDuration(newDuration)
  }

  const ActionButton = () => {
    function renewEnd () {
      onHide()
      renewNameEnd(label)
    }

    if (renewAction === 'renewStarted') {
      return (
        <Button variant="secondary" disabled>
          {t('nm.sta.Renewing')}
          <Spinner animation="border" variant="light" className="ms-2 spinner-acting" />
        </Button>
      )
    }

    if (renewAction === 'renewFailed' || renewAction === 'renewSucceeded' || renewAction === 'renewSuspended') {
      return <Button variant="primary" onClick={()=>renewEnd()}>{t('c.end')}</Button>
    }

    return (
      <>
        <Button variant="secondary" onClick={onHide}>{t('c.cancel')}</Button>
        <Button variant="primary" onClick={()=>{
            renewName(label, moment.duration(duration, 'years').asSeconds())
          }
        }>{t('c.confirm')}</Button>
      </>
    )
  }

  const RenewActionMsgIcon = () => {
    if (renewAction === 'renewSucceeded') {
      return (
        <span className="modal-message-text">
          <FontAwesomeIcon icon={faCircleCheck} className="modal-message-icon action-succeeded" />
        </span>
      )
    } else if (renewAction === 'renewFailed') {
      return (
        <span className="modal-message-text">
          <FontAwesomeIcon icon={faCircleXmark} className="modal-message-icon action-failed" />
        </span>
      )
    } else if (renewAction === 'renewSuspended') {
      return (
        <span className="modal-message-text">
          <FontAwesomeIcon icon={faCircleMinus} className="modal-message-icon action-suspend" />
        </span>
      )
    } else {
      return null
    }
  }
  
  const RenewActionMsg = () => {
    if (renewAction === 'renewBefore' || renewAction === 'renewStarted') {
      return null
    }
    return (
      <p className={"modal-message message-action"}>
        <span className="modal-message-time" title={renewMsges[0].time.fromNow()}>
          {renewMsges[0].time.format('HH:mm:ss')}
        </span>
        <FontAwesomeIcon icon={faChevronRight} className="modal-message-icon" />
        <RenewActionMsgIcon />
      </p>
    )
  }

  const RenewInfoMsges = () => {
    return (
      renewMsges.slice(1).map((message, index) => { 
        return (
          <p key={index} className={"modal-message message-" + message.type}>
            <span className="modal-message-time" title={message.time.fromNow()}>
              {message.time.format('HH:mm:ss')}
            </span>
            <FontAwesomeIcon icon={faChevronRight} className="modal-message-icon" />
            <span className="modal-message-text" dangerouslySetInnerHTML={{ __html: message.text }} />
          </p>
        )
      })
    )
  }

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>{ t('modal.renew.title') }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="modal-tip">
          {t('modal.renew.tip')}
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
                  disabled={ !(renewAction === "renewBefore" || renewAction === "renewSuspended") } 
                />
                <InputGroup.Text>{t('c.years')}</InputGroup.Text>
                <InputGroup.Text className="ms-2 until-time">
                  <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
                  { moment.unix(expiresTime).add(moment.duration(duration, 'years').asSeconds(), 'seconds').format('L') } 
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>
        <RenewInfoMsges />
        <RenewActionMsg />
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />    
      </Modal.Footer>
    </Modal>
  )
}

export default RenewalModal
