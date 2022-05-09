import React from 'react';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
// import { hexlify } from 'ethers/lib/utils';
// import confFile from '../../conf.json'


export default function TestBar(props) {

  const testFunc1 = async () => {
    const a = [
      {
        "label": "la",
        "age": "a1"
      },
      {
        "label": "lb",
        "age": "b1"
      },
      {
        "label": "lc",
        "age": "c1"
      }
    ]
    const r = a.filter(nameItem => nameItem.label === 'lb')[0]
    console.log(r)
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
