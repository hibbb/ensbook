import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { t } from 'i18next';

export const LabelCell = (props) => {
  const { label, level, wrapped, isMyName, index, nameInfo, setAndStoreNameInfo } =
    props;
  // for td-label
  const nameLink = `https://app.ens.domains/${label}.eth`;

  const [clickTimeout, setClickTimeout] = React.useState(null);

  const oneClickToLevelUp = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      levelUp(index);
    }, 350);
    
    setClickTimeout(timeoutId);
  };

  const levelUp = (index) => {
    nameInfo[index].level = (nameInfo[index].level + 1) % 2;
    setAndStoreNameInfo(nameInfo, false);
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{t('tb.td.tips.lb')}</Tooltip>}
      >
        <span
          className={`td-level td-level-${level} is-my-name-${isMyName} is-wrapped-${wrapped}`}
          onClick={() => oneClickToLevelUp()}
        >
          {label}
          <span className="dot-eth">.eth</span>
        </span>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>ENS APP</Tooltip>}>
        <a href={nameLink} target="_blank" rel="noreferrer">
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            className="external-link-icon"
          />
        </a>
      </OverlayTrigger>
    </>
  );
};
