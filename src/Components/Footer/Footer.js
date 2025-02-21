import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { getConf } from '../Global/globals';
import packageJson from '../../../package.json';

export default function Footer() {
  return (
    <div className="row">
      <div className="footnode-left align-self-center col-6">
        <div className="footnotes px-2">
          <a href="https://x.com/forlbb" target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
        </div>
      </div>
      <div className="footnode-right align-self-center col-6">
        <div className="footnotes px-2">
          <span className="version-v ps-2">v</span>
          <span className="version-number pe-2">{packageJson.version}</span>
          <a href={getConf().repository} target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
    </div>
  );
}
