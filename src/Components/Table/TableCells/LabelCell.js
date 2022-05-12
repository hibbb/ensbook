import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import { t } from 'i18next';

export const LabelCell = (props) => {
  const { label, level, index, nameInfo, setAndStoreNameInfo } = props
  // for td-label
  const nameLink = `https://app.ens.domains/name/${label}.eth`
  let labelClickCount = 0
  const oneClickToLevelUp = () => {
    labelClickCount += 1;
    setTimeout(() => {
      if (labelClickCount === 1) {
        levelUp(index)
      }
      labelClickCount = 0
    }, 350);
  }

  const levelUp = (index) => {
    nameInfo[index].level = (nameInfo[index].level + 1) % 2
    setAndStoreNameInfo(nameInfo, false)
  } 
  
  return (
    <>
      <OverlayTrigger placement="top" overlay={<Tooltip>{t('tb.td.tips.lb')}</Tooltip>}>
        <span className={`td-level td-level-${level}`} onClick={()=>oneClickToLevelUp()}>
          {label}
        </span>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>ENS APP</Tooltip>}>
        <a href={nameLink} target="_blank" rel="noreferrer">
          <BoxArrowUpRight className="external-link-icon" />
        </a>
      </OverlayTrigger>
    </>
  )
}
