import React, { useState } from 'react';
import {
  Modal,
  Button,
  InputGroup,
  FormControl,
  Col,
  Row,
  Spinner,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faCircleCheck,
  faCircleXmark,
  faCircleMinus,
} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { t } from 'i18next';

const RenewalsModal = (props) => {
  const {
    show,
    onHide,
    renewNames,
    renewNamesEnd,
    renewList,
    clearRenewList,
    defaultDuration,
    renewsMsges,
  } = props;

  // renewBefore, renewStarted, renewSucceeded, renewFailed, renewSuspended
  const renewsAction = renewsMsges[0].text;

  const [duration, setDuration] = useState(defaultDuration); // duration: as Years

  const handleChange = (event) => {
    const { value } = event.target;
    const newDuration = value;
    setDuration(newDuration);
  };

  const ActionButton = () => {
    function renewsEnd() {
      onHide();
      renewNamesEnd(renewList);
      clearRenewList();
    }

    if (renewsAction === 'renewsStarted') {
      return (
        <Button variant="secondary" disabled>
          {t('nm.sta.Renewing')}
          <Spinner
            animation="border"
            variant="light"
            className="ms-2 spinner-acting"
          />
        </Button>
      );
    }

    if (
      renewsAction === 'renewsFailed' ||
      renewsAction === 'renewsSucceeded' ||
      renewsAction === 'renewsSuspended'
    ) {
      return (
        <Button variant="primary" onClick={() => renewsEnd()}>
          {t('c.end')}
        </Button>
      );
    }

    return (
      <>
        <Button variant="secondary" onClick={onHide}>
          {t('c.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            renewNames(
              renewList,
              moment.duration(duration, 'years').asSeconds()
            );
          }}
        >
          {t('c.confirm')}
        </Button>
      </>
    );
  };

  const RenewsActionMsgIcon = () => {
    if (renewsAction === 'renewsSucceeded') {
      return (
        <span className="modal-message-text">
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="modal-message-icon action-succeeded"
          />
        </span>
      );
    }
    if (renewsAction === 'renewsFailed') {
      return (
        <span className="modal-message-text">
          <FontAwesomeIcon
            icon={faCircleXmark}
            className="modal-message-icon action-failed"
          />
        </span>
      );
    }
    if (renewsAction === 'renewsSuspended') {
      return (
        <span className="modal-message-text">
          <FontAwesomeIcon
            icon={faCircleMinus}
            className="modal-message-icon action-suspend"
          />
        </span>
      );
    }
    return null;
  };

  const RenewsActionMsg = () => {
    if (renewsAction === 'renewsBefore' || renewsAction === 'renewsStarted') {
      return null;
    }
    return (
      <p className={'modal-message message-action'}>
        <span
          className="modal-message-time"
          title={renewsMsges[0].time.fromNow()}
        >
          {renewsMsges[0].time.format('HH:mm:ss')}
        </span>
        <FontAwesomeIcon icon={faChevronRight} className="modal-message-icon" />
        <RenewsActionMsgIcon />
      </p>
    );
  };

  const RenewsInfoMsges = () => {
    return renewsMsges.slice(1).map((message) => {
      return (
        <p key={message.time.format('HH:mm:ss')} className={`modal-message message-${message.type}`}>
          <span className="modal-message-time" title={message.time.fromNow()}>
            {message.time.format('HH:mm:ss')}
          </span>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="modal-message-icon"
          />
          <span
            className="modal-message-text"
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
        </p>
      );
    });
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>{t('modal.renews.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="modal-tip">{t('modal.renews.tip')}</p>
        <div className="mb-3 duration-input">
          <Row>
            <Col sm="9">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>{t('c.name')}: </InputGroup.Text>
                <FormControl
                  className="modal-name-label"
                  value={t('modal.renews.names')}
                  disabled
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col sm="9">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>{t('c.duration')}: </InputGroup.Text>
                <FormControl
                  value={duration}
                  onChange={handleChange}
                  disabled={
                    !(
                      renewsAction === 'renewsBefore' ||
                      renewsAction === 'renewsSuspended'
                    )
                  }
                />
                <InputGroup.Text>{t('c.years')}</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>
        <RenewsInfoMsges />
        <RenewsActionMsg />
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />
      </Modal.Footer>
    </Modal>
  );
};

export default RenewalsModal;
