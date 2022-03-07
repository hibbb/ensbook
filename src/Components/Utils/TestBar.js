import React, { useState } from 'react';

export default function TestBar(props) {
  const [state, setstate] = useState({a: 1, b: 2, c: "ccc"});

  const testFunc1 = async (props) => {
    console.log(state)
    state.a = 0
    setstate(state)
    console.log(state)
  }

  const testFunc2 = async (a, b) => {
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
