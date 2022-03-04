import React from 'react';

export default function TestBar(props) {

  const testFunc1 = async () => {
    document.getElementById('testBarSub').innerHTML = '<a href="https://www.baidu.com/" target="_blank" rel="noreferrer">baidu</a>'
  }

  const testFunc2 = async (a, b) => {
  }

  return (
    <>
      <div id="testBar" className="test-bar p-2 mt-3 text-center">
        <span className="mx-2" onClick={()=>testFunc1()}>Test-1</span>
        <span className="mx-2" onClick={()=>testFunc2()}>Test-2</span>
        <div id="testBarSub"></div>
        
      </div>
    </>
  )
}
