import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const UnsupportedNetworkModal = (props) => {
  const { show, disconnectApp, t } = props
  return (
    <Modal
      show={show}
      //onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t('modal.errorNetwork.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {t('modal.errorNetwork.text')}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={()=>disconnectApp()}>{t('c.disconnect')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UnsupportedNetworkModal

