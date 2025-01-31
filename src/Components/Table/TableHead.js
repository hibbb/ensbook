import React, { useState } from 'react';
import { utils } from 'ethers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleXmark,
  faSquareCaretDown,
} from '@fortawesome/free-regular-svg-icons';
import {
  faCalculator,
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
  faRotate,
  faArrowDownAZ,
  faArrowDownZA,
  faArrowDownWideShort,
  faArrowDownShortWide,
  faList,
  faListCheck,
  faClock,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { t } from 'i18next';
import RegistrationsModal from '../Utils/RegistrationsModal';
import TooltipEstimateCost from './TooltipEstimateCost';
import {
  haveRegistrableNames,
  haveUnregistrableNames,
  isCustomWallet,
} from '../Global/globals';
import RenewalsModal from '../Utils/RenewalsModal';

export const TableHead = (props) => {
  const {
    type,
    reconnecting,
    fetching,
    nameInfo,
    setAndStoreNameInfo,
    conf,
    updateNames,
    registerNames,
    registerNamesEnd,
    regList,
    clearRegList,
    renewNames,
    renewNamesEnd,
    renewList,
    clearRenewList,
    hideNames,
    switchHideFlag,
    removeNames,
    estimateCosts,
    regMsges,
    regsMsges,
    renewsMsges,
    getDefaultNameReceiver,
  } = props;

  const [regNamesModalShow, setRegNamesModalShow] = useState(false);
  const [renewNamesModalShow, setRenewNamesModalShow] = useState(false);

  const isBulkReg = () => regList.length > 0;
  const isBulkRenew = () => renewList.length > 0;

  const initialAscFlags = {
    label: true,
    length: true,
    level: false,
    expiresTime: true,
    releaseTime: true,
    status: true,
  };
  const [ascFlags, setAscFlags] = useState(initialAscFlags);

  const jsonSort = (array, key) => {
    if (array.length < 2 || !key || typeof array[0] !== 'object') return array;
    if (typeof array[0][key] === 'number') {
      ascFlags[key]
        ? array.sort((x, y) => x[key] - y[key])
        : array.sort((x, y) => y[key] - x[key]);
    }
    if (typeof array[0][key] === 'string') {
      ascFlags[key]
        ? array.sort((x, y) => x[key].localeCompare(y[key]))
        : array.sort((x, y) => y[key].localeCompare(x[key]));
    }

    setAscFlags({ ...ascFlags, [key]: !ascFlags[key] });

    return array;
  };

  const initialEstimating = {
    title: 'tb.th.tips.estAll',
    status: 'before',
    cost: '',
  };
  const [estimating, setEstimating] = useState(initialEstimating);

  const estimateThese = async () => {
    setEstimating({ ...initialEstimating, status: 'in' });
    const costEther = utils.formatEther(await estimateCosts(regList));
    setEstimating({ ...initialEstimating, status: 'after', cost: costEther });
  };

  const statusesArr = Array.from(new Set(nameInfo.map((item) => item.status)));

  const removalTags = statusesArr.map((status) => {
    return (
      <span
        key={status}
        className={`remove-tag status-${status}`}
        onClick={() => removeNames(status)}
      >
        {t(`nm.sta.${status}`)}{' '}
        <FontAwesomeIcon icon={faCircleXmark} className="light-gray" />
      </span>
    );
  });

  const nonBulkRegable = () =>
    reconnecting || !isCustomWallet(conf) || !isBulkReg();
  const nonBulkRenewable = () =>
    reconnecting || type === 'readonly' || !isBulkRenew();
  const nonFoldable = () =>
    !haveRegistrableNames(nameInfo) || !haveUnregistrableNames(nameInfo);
  const nonUpdatable = () => nameInfo.length < 1;
  const nonSortable = () => fetching || nameInfo.length < 2;
  const nonSortableByLength = () =>
    fetching || new Set(nameInfo.map((item) => item.length)).size < 2;
  const nonSortableByLevel = () =>
    fetching || new Set(nameInfo.map((item) => item.level)).size < 2;
  const nonRemovable = () => fetching || statusesArr.length < 1;

  return (
    <thead>
      <tr className="ebr-tb-row">
        <th>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.update')}</Tooltip>}
          >
            <button
              type="button"
              className="btn-plain btn-update"
              disabled={nonUpdatable()}
              onClick={() => updateNames()}
            >
              <FontAwesomeIcon icon={faRotate} />
            </button>
          </OverlayTrigger>
        </th>
        <th>
          <span id="th-label">{t('tb.th.lb')}</span>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.lb.label')}</Tooltip>}
          >
            <button
              type="button"
              className="btn-plain ms-2 th-sortable"
              disabled={nonSortable()}
              onClick={() => setAndStoreNameInfo(jsonSort(nameInfo, 'label'))}
            >
              {ascFlags.label ? (
                <FontAwesomeIcon icon={faArrowDownAZ} />
              ) : (
                <FontAwesomeIcon icon={faArrowDownZA} />
              )}
            </button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.lb.length')}</Tooltip>}
          >
            <button
              type="button"
              className="btn-plain ms-2 th-sortable"
              disabled={nonSortableByLength()}
              onClick={() => setAndStoreNameInfo(jsonSort(nameInfo, 'length'))}
            >
              {ascFlags.length ? (
                <FontAwesomeIcon icon={faArrowDownWideShort} />
              ) : (
                <FontAwesomeIcon icon={faArrowDownShortWide} />
              )}
            </button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.lb.level')}</Tooltip>}
          >
            <button
              type="button"
              className="btn-plain ms-2 th-sortable"
              disabled={nonSortableByLevel()}
              onClick={() => setAndStoreNameInfo(jsonSort(nameInfo, 'level'))}
            >
              {ascFlags.level ? (
                <FontAwesomeIcon icon={faList} />
              ) : (
                <FontAwesomeIcon icon={faListCheck} />
              )}
            </button>
          </OverlayTrigger>
        </th>
        <th>
          <span id="th-expiresTime">{t('tb.th.sta')}</span>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.sta')}</Tooltip>}
          >
            <button
              type="button"
              className="btn-plain ms-2 th-sortable"
              disabled={nonSortable()}
              onClick={() =>
                setAndStoreNameInfo(jsonSort(nameInfo, 'expiresTime'))
              }
            >
              {ascFlags.expiresTime ? (
                <FontAwesomeIcon icon={faClock} />
              ) : (
                <FontAwesomeIcon icon={faClockRotateLeft} />
              )}
            </button>
          </OverlayTrigger>
        </th>
        <th>{t('tb.th.lu')}</th>
        <th>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.regAll')}</Tooltip>}
          >
            <button
              type="button"
              disabled={nonBulkRegable()}
              className={
                `btn-plain btn-bulk-reg ${isBulkReg() ? 'is-bulk-reg' : ''}`
              }
              onClick={() => setRegNamesModalShow(true)}
            >
              {t('tb.th.reg')}
            </button>
          </OverlayTrigger>
          <RegistrationsModal
            show={regNamesModalShow}
            onHide={() => setRegNamesModalShow(false)}
            registerNames={registerNames}
            registerNamesEnd={registerNamesEnd}
            regList={regList}
            clearRegList={clearRegList}
            defaultDuration={conf.custom.register.duration}
            regMsges={regMsges}
            regsMsges={regsMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                <TooltipEstimateCost estimating={estimating} />
              </Tooltip>
            }
          >
            <button
              type="button"
              disabled={!isBulkReg()}
              id="btn-estimate-all"
              className="btn-plain btn-sub ms-2"
              onClick={() => estimateThese()}
            >
              <FontAwesomeIcon icon={faCalculator} />
            </button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                {t(`tb.th.tips.hideNames.${hideNames ? 'show' : 'hide'}`)}
              </Tooltip>
            }
          >
            <button
              type="button"
              disabled={nonFoldable()}
              className="btn-plain btn-sub ms-2"
              onClick={() => switchHideFlag()}
            >
              {hideNames ? (
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
              ) : (
                <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />
              )}
            </button>
          </OverlayTrigger>
        </th>
        <th>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('tb.th.tips.renew')}</Tooltip>}
          >
            <button
              type="button"
              disabled={nonBulkRenewable()}
              className={
                `btn-plain btn-bulk-renew ${isBulkRenew() ? 'is-bulk-renew' : ''}`
              }
              onClick={() => setRenewNamesModalShow(true)}
            >
              {t('tb.th.renew')}
            </button>
          </OverlayTrigger>
          <RenewalsModal
            show={renewNamesModalShow}
            onHide={() => setRenewNamesModalShow(false)}
            renewNames={renewNames}
            renewNamesEnd={renewNamesEnd}
            renewList={renewList}
            clearRenewList={clearRenewList}
            defaultDuration={conf.custom.renew.duration}
            renewsMsges={renewsMsges}
          />
        </th>
        <th className="th-remove">
          <div className="dropdown">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t('tb.th.tips.remAll')}</Tooltip>}
            >
              <button
                disabled={nonRemovable()}
                className="btn-plain dropdown-toggle"
                type="button"
                id="dropdown-remove-names"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FontAwesomeIcon icon={faSquareCaretDown} />
              </button>
            </OverlayTrigger>
            <ul
              className="dropdown-menu remove-list"
              aria-labelledby="dropdown-remove-names"
            >
              <li>{removalTags}</li>
              <li className="mt-1">
                <span
                  className="remove-tag remove-lower"
                  onClick={() => removeNames('Lower')}
                >
                  {t('tb.th.lower')}{' '}
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="light-gray"
                  />
                </span>
                <span
                  className="remove-tag remove-all"
                  onClick={() => removeNames('All')}
                >
                  {t('tb.th.all')}{' '}
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="light-gray"
                  />
                </span>
              </li>
            </ul>
          </div>
        </th>
      </tr>
    </thead>
  );
};
