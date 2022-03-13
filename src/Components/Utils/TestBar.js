import React from 'react';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
import { hexlify } from 'ethers/lib/utils';

export default function TestBar(props) {
  const { provider } = props

  const testFunc1 = async () => {
    const a = await provider.resolveName()
    console.log(a)
  }

  const testFunc2 = async () => {
    testFunc1(1,2)
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
