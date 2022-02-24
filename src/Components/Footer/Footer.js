import React from "react";
import { Github, Twitter } from 'react-bootstrap-icons';
import packageJson from '../../../package.json'

export default function Footer(props) {
  const { repository } = props

  return (
    <div className="row">
      <div className="footnode-left align-self-center col-6">
        <div className="footnotes px-2">
          <a href="https://twitter.com/forlbb" target="_blank" rel="noreferrer"><Twitter /></a>
        </div>
      </div>
      <div className="footnode-right align-self-center col-6">
        <div className="footnotes px-2">
          <span className="version-v ps-2">v</span>
          <span className="version-number pe-2">{packageJson.version}</span>
          <a href={repository} target="_blank" rel="noreferrer"><Github /></a>
        </div>
      </div>
    </div>
  )
}