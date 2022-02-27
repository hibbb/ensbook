import React from 'react';
//import moment from 'moment';
//import { utils } from 'ethers';
//import { clearWeb3Modal, getWeb3Modal, createWeb3Modal } from '../Global/globals'

export default function TestBar() {

  const testFunc1 = async () => {
    console.log(JSON.parse(window.localStorage.getItem("nameInfo123")))
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