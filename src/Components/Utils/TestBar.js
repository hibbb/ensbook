import React from 'react';
//import moment from 'moment'
// import { BigNumber, utils } from 'ethers';
// import { hexlify } from 'ethers/lib/utils';
// import confFile from '../../conf.json'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'


export default function TestBar(props) {

  const testFunc1 = async () => {

    let a = "aaa"
    let b = "bbb"

    //const ni = [a]

    console.log([a,b])
  }

  const testFunc2 = async () => {

    const labels = ["liubenben", "ceshi"]


    const namesQuery = `
      query($labels: [String!]) {
        registrations(where: {labelName_in: $labels}) {
          labelName,
          id,
          expiryDate,
          registrationDate,
        }
      }
    `
    
    const client = new ApolloClient({
      uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
      cache: new InMemoryCache(),
    })
    
    const data = await client.query({
        query: gql(namesQuery),
        variables: {
          labels: labels,
        },
      })

      console.log('Subgraph data: ', data.data)

      // .then((data) => console.log('Subgraph data: ', data.data))
      // .catch((err) => {
      //   console.log('Error fetching data: ', err)
      // })

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
