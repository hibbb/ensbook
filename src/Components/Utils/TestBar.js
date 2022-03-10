import React from 'react';
//import moment from 'moment'
import { BigNumber, utils } from 'ethers';

export default function TestBar(props) {

  const testFunc1 = async () => {
    const tid = utils.id('123')
    console.log(tid)
    const de = BigNumber.from(tid).toString()
    console.log(de)
  }

  const testFunc2 = async () => {
  }

  return (
    <>
      <div id="testBar" className="test-bar p-2 mt-3 text-center">
        <span className="mx-2" onClick={()=>testFunc1()}>Test-1</span>
        <span className="mx-2" onClick={()=>testFunc2()}>Test-2</span>
      </div>
    </>
  )
}
