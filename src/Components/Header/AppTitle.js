import React from 'react';

function getPageTag(props) {
  const pageTag = props.pageTag
  const pageTagStyle = { backgroundColor: props.pageTagColor }
  if (pageTag.length > 0) {
    return (
      <span className="page-tag ms-2 px-1" style={pageTagStyle}>{pageTag}</span>
    )
  }
}

export default function AppTitle(props) {
  return (
      <h1>
        <a href="/">
          <span className="title-ens">ENS</span><span className="title-book">Book</span>
        </a>
        {getPageTag(props)}
      </h1>
  )
}