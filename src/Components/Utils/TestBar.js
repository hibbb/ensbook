import React from 'react';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
// import { hexlify } from 'ethers/lib/utils';
// import confFile from '../../conf.json'


export default function TestBar(props) {

  const testFunc1 = async () => {
    let a = ['a', 'b', 'c']
    a.filter(item => item !== 'b')
    console.log(a)
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
