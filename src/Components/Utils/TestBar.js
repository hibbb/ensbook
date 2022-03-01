import React from 'react';
// import moment from 'moment';
// import { ethers, utils } from 'ethers';
// import { clearWeb3Modal, getWeb3Modal, createWeb3Modal } from '../Global/globals'
// import { Modal } from 'bootstrap';

export default function TestBar(props) {

  const testFunc1 = async () => {
    console.log('555')
  }

  const testFunc2 = async () => {
  }

  return (
    <div className="test-bar p-2 mt-3 text-center">
      <span className="mx-2" onClick={testFunc1}>Test-1</span>
      <span className="mx-2" onClick={testFunc2}>Test-2</span>
    </div>
  )
}