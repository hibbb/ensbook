import React from 'react';
//import moment from 'moment';
//import { utils } from 'ethers';

export default function TestBar() {

  const testFunc1 = async () => {
    const a = "123"
    const b = `456${a}`
    console.log(b)
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