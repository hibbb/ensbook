import React from 'react';
import moment from 'moment'

export default function TestBar(props) {

  let regInfo = { a: "a1", b: "b1", c: "c1"}

  const testFunc1 = async () => {
    let { b, a, c, d } = regInfo
    console.log(a)
    console.log(b)
    console.log(c)
    console.log(d)
    const m = moment.duration(null, 'seconds').asYears().toFixed(1)
    console.log(m)
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
