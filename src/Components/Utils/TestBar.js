import { isAddress } from 'ethers/lib/utils';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { ExclamationCircle } from 'react-bootstrap-icons';
import { getNamesOfOwner } from '../Global/globals';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
// import { hexlify } from 'ethers/lib/utils';
// import confFile from '../../conf.json'


export default function TestBar(props) {

  const testFunc1 = async () => {
    getNamesOfOwner("0xd5D171a9AA125AF13216C3213B5A9Fc793FcCF2c")
  }

  const testFunc2 = async () => {
    console.log(isAddress("0xd5D171a9AA125AF13216C3213B5A9Fc793FcCF2c"))
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
