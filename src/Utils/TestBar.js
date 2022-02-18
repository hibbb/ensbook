import React from 'react';
//import { utils } from 'ethers';
//import {attributes} from 'https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/0x1a9bfe7ff93ea440afc1a1da8e18c6f455b14dba01353785bc324ef240f55103'

export default function TestBar() {

  const testFunc1 = async () => {
    const baseUrl = 'https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/0x1a9bfe7ff93ea440afc1a1da8e18c6f455b14dba01353785bc324ef240f55103'
    const getJson = async () => {
      const response = await fetch(baseUrl)
      if (response.ok) {
        return response.json()
      }
    }

    const ob = await getJson()
    console.log(ob.attributes)
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