import React from "react";
import { Modal, Button } from "react-bootstrap";
import { t } from "i18next";

const UnsupportedNetworkModal = (props) => {
  const { show, disconnectApp } = props;
  return (
    <Modal
      show={show}
      //onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>{t("modal.errorNetwork.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{t("modal.errorNetwork.text")}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => disconnectApp()}>
          {t("c.disconnect")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UnsupportedNetworkModal;
