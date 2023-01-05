import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { ExclamationCircle } from 'react-bootstrap-icons';
import { getPremiumPrice } from '../Global/globals';
import { ethers, getDefaultProvider } from 'ethers';


export default function TestBar(props) {

  const testFunc1 = async () => {
    const p = await props.getETHPrice()
    console.log(p)
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
