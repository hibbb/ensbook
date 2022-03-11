import React from 'react';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
import { hexlify } from 'ethers/lib/utils';

export default function TestBar(props) {

  const testFunc1 = async () => {
    console.log(0.5 ^ 0.25)
    
    // console.log(0.5 ^ 2/65536 * (10 ** 18))
    // console.log(0.5 ^ 3/65536 * (10 ** 18))
    // console.log(0.5 ^ 4/65536 * (10 ** 18))
    // console.log(0.5 ^ 5/65536 * (10 ** 18))
    // console.log(BigNumber.from())
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
