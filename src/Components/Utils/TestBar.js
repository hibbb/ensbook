import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

export default function TestBar(props) {
  const testFunc1 = async () => {};

  const testFunc2 = async () => {};

  return (
    <>
      <div id="testBar" className="test-bar p-3 mt-3">
        <Row>
          <Col sm="8" className="ps-3 text-start test-bar-alert">
            <span>
              <FontAwesomeIcon icon={faCircleExclamation} className="mx-2" />
              The <strong>dev branch</strong> is only for dev test.
            </span>
          </Col>
          <Col sm="4" className="text-end test-bar-buttons">
            <span className="mx-2" onClick={() => testFunc1()}>
              <strong>Test-1</strong>
            </span>
            <span className="mx-2" onClick={() => testFunc2()}>
              <strong>Test-2</strong>
            </span>
          </Col>
        </Row>
      </div>
    </>
  );
}
