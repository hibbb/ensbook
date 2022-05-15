import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { ExclamationCircle } from 'react-bootstrap-icons';


export default function TestBar(props) {

  const testFunc1 = async () => {
    let a = ['oklend', '12h00m00', '61997', 'baffler', '51990', 'samecoin', '20h59', 'flatland', 'npool', null, '00h00m01']
    let b = a.filter(item => item && item.trim())
    console.log(b)
  }

  const testFunc2 = async () => {
  }

  return (
    <>
      <div id="testBar" className="test-bar p-3 mt-3">
        <Row>
          <Col sm="8" className="ps-3 text-start test-bar-alert">
            <span><ExclamationCircle className="mx-2" />The <strong>dev branch</strong> is only for dev test.</span>
          </Col>
          <Col sm="4" className="text-end test-bar-buttons">
            <span className="mx-2" onClick={()=>testFunc1()}><strong>Test-1</strong></span>
            <span className="mx-2" onClick={()=>testFunc2()}><strong>Test-2</strong></span>
          </Col>
        </Row>
      </div>
    </>
  )
}
