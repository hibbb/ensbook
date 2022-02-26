import React from 'react';
//import moment from 'moment';
//import { utils } from 'ethers';
import { clearWeb3Modal, getWeb3Modal, createWeb3Modal } from '../Global/globals'

export default function TestBar() {

  const testFunc1 = async () => {
    clearWeb3Modal()
    console.log('test1:clear')
  }

  const testFunc2 = async () => {
    createWeb3Modal()
    console.log('test2:connect')
  }

  return (
    <div className="test-bar p-2 mt-3 text-center">
      <span className="mx-2" onClick={testFunc1}>Test-1</span>
      <span className="mx-2" onClick={testFunc2}>Test-2</span>
    </div>
  )
}