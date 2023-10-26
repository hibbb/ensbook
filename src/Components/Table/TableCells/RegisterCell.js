import React, { useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { t } from 'i18next';
import { isReadOnly, isRegistrable } from '../../Global/globals';
import TooltipEstimateCost from '../TooltipEstimateCost';
import RegistrationModal from '../../Utils/RegistrationModal';
import { formatEther } from 'viem';

export const RegisterCell = (props) => {
  const {
    label,
    status,
    reconnecting,
    defaultDuration,
    registerName,
    regStep,
    addNameToRegList,
    removeNameFromRegList,
    estimateCost,
    registerNameEnd,
    regMsges,
    getDefaultNameReceiver,
  } = props;

  const initialEstimating = {
    title: 'tb.td.tips.est',
    status: 'before',
    cost: '',
  };
  const [estimating, setEstimating] = useState(initialEstimating);

  const estimateThis = async () => {
    setEstimating({ ...initialEstimating, status: 'in' });
    const costEther = formatEther(await estimateCost(label));
    setEstimating({ ...initialEstimating, status: 'after', cost: costEther });
  };

  const [modalShow, setModalShow] = useState(false);

  if (isRegistrable(status)) {
    return (
      <div
        id={'registerName-' + label}
        className="btn-group"
        role="group"
        aria-label="RegisterName or Estimate Price"
      >
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip>
              {regStep > 0
                ? t('tb.td.tips.continue')
                : t('tb.td.tips.reg', { label: label })}
            </Tooltip>
          }
        >
          <button
            type="button"
            disabled={ isReadOnly() || reconnecting }
            className="btn-plain btn-reg"
            onClick={() => setModalShow(true)}
          >
            {regStep > 0 ? t('tb.td.continue') : t('tb.td.reg')}
          </button>
        </OverlayTrigger>
        {regStep > 0 ? (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>{t('tb.td.tips.regStep', { regStep: regStep })}</Tooltip>
            }
          >
            <span className="td-reg-step">{regStep}/3</span>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip>
                <TooltipEstimateCost estimating={estimating} t={t} />
              </Tooltip>
            }
          >
            <button
              type="button"
              className="btn-plain btn-sub ms-2"
              onClick={() => estimateThis()}
            >
              <FontAwesomeIcon icon={faCalculator} />
            </button>
          </OverlayTrigger>
        )}
        <RegistrationModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          defaultDuration={defaultDuration}
          label={label}
          registerName={registerName}
          regStep={regStep}
          registerNameEnd={registerNameEnd}
          regMsges={regMsges}
          getDefaultNameReceiver={getDefaultNameReceiver}
          t={t}
        />
      </div>
    );
  }

  if (status === 'Unknown') {
    return (
      <div
        id={'trigger-unknown-' + label}
        className="btn-group"
        role="group"
        aria-label="Unknown"
      >
        <button type="button" className="btn-plain" disabled>
          {t('nm.sta.Unknown')}
        </button>
      </div>
    );
  }

  return (
    <div
      id={'trigger-reged-' + label}
      className="btn-group"
      role="group"
      aria-label="RegisterName"
    >
      <button type="button" className="btn-plain" disabled>
        {t('tb.td.reged')}
      </button>
    </div>
  );
};
