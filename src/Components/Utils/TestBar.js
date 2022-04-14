import React from 'react';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
import { hexlify } from 'ethers/lib/utils';
import confFile from '../../conf.json'

export default function TestBar(props) {
  const { provider } = props

  const testFunc1 = async () => {
    let confStored = JSON.parse(window.localStorage.getItem("confInfo"))
    // console.log("confStored:")
    // console.log(confStored.custom.display.lookup)
    // console.log("confFile:")
    // console.log(confFile.custom.display.lookup)
    const oldLookup = confStored.custom.display.lookup
    const newLookup = confFile.custom.display.lookup
    console.log(oldLookup)
    console.log(newLookup)
    if (Object.keys(oldLookup).length < Object.keys(newLookup).length) {
      console.log("oldLookup.length < newLookup.length")
      for (let item in oldLookup) {
        newLookup[item] = oldLookup[item]
        console.log(item)
      }
      confStored.custom.display.lookup = newLookup
    }
    console.log("confStored:")
    console.log(confStored.custom.display.lookup)
    console.log("confFile:")
    console.log(confFile.custom.display.lookup)
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
