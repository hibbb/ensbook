import React from 'react';

export default function TestBar() {

  const testFunc1 = async () => {
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