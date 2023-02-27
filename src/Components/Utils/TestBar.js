import React from "react";
import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function TestBar(props) {
  const testFunc1 = async () => {
    let a = displayNumber(88567)
    console.log(a)
  };
  const displayNumber = (num) => { 
    if (num < 10) {
      num = num.toFixed(2)
    }
    else if (num < 100) {
      num = num.toFixed(1)
    }
    else if (num < 1000) {
      num = num.toFixed(0)
    }
    else if (num < 10000) {
      num = (num/1000).toFixed(2) + 'K'
    }
    else if (num < 100000) {
      num = (num / 1000).toFixed(1) + 'K'
    }
    else if (num < 1000000) {
      num = (num / 1000).toFixed(0) + 'K'
    }
    else if (num < 10000000) {
      num = (num / 1000000).toFixed(2) + 'M'
    }
    else if (num < 100000000) {
      num = (num / 1000000).toFixed(1) + 'M'
    }
    else {
      num = (num / 1000000).toFixed(0) + 'M'
    }
    return num;
  }
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
