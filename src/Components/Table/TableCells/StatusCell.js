import React, { useState } from 'react';
import moment from 'moment';
import Clock from 'react-live-clock';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { t } from 'i18next';
import { getPremiumPrice } from '../../Global/globals';

export const StatusCell = (props) => {
  const {
    label,
    status,
    ethPrice,
    registrationTime,
    releaseTime,
    expiresTime,
    updateNames,
    priceUnit,
    priceRange,
  } = props;

  // const [premiumEndingFlag, setPremiumEndingFlag] = useState(false);

  const graceEndingFlag =
    status === 'Grace' &&
    moment().add(7, 'days').isAfter(moment.unix(releaseTime));
  const graceEndingClass = graceEndingFlag ? ' grace-ending' : '';

  const premiumEndingClass = ''; // premiumEndingFlag ? ' premium-ending' : "";

  const displayNumber = (num) => {
    if (num < 0.9995) {
      num = parseFloat((num / 1).toFixed(3));
    } else if (num < 9.995) {
      num = parseFloat((num / 1).toFixed(2));
    } else if (num < 99.95) {
      num = parseFloat((num / 1).toFixed(1));
    } else if (num < 999.5) {
      num = (num / 1).toFixed(0);
    } else if (num < 9995) {
      num = parseFloat((num / 1000).toFixed(2)) + 'K';
    } else if (num < 99950) {
      num = parseFloat((num / 1000).toFixed(1)) + 'K';
    } else if (num < 999500) {
      num = (num / 1000).toFixed(0) + 'K';
    } else if (num < 9995000) {
      num = parseFloat((num / 1000000).toFixed(2)) + 'M';
    } else if (num < 99950000) {
      num = parseFloat((num / 1000000).toFixed(1)) + 'M';
    } else {
      num = (num / 1000000).toFixed(0) + 'M';
    }
    return num;
  };

  const StatusText = () => {
    let text = t('nm.sta.' + status);

    if (status === 'Premium') {
      let inUsd = getPremiumPrice(releaseTime);
      let premiumPrice = '';
      let priceUnitIcon;

      if (priceUnit === 'ETH') {
        let inEth = (inUsd * 1e8) / ethPrice;
        premiumPrice = displayNumber(inEth);
        priceUnitIcon = <FontAwesomeIcon icon={faEthereum} />;
      } else {
        premiumPrice = displayNumber(inUsd);
        priceUnitIcon = <FontAwesomeIcon icon={faDollarSign} />;
      }

      //setPremiumEndingFlag(premiumPrice < priceRange)

      return (
        <>
          + {priceUnitIcon} {premiumPrice}
        </>
      );
    }

    return <>{text}</>;
  };

  const jsonSortByNumber = (array, key) => {
    if (
      array.length < 2 ||
      !key ||
      typeof array[0] !== 'object' ||
      typeof array[0][key] !== 'number'
    ) {
      return array;
    }
    array.sort(function (x, y) {
      return x[key] - y[key];
    });
    return array;
  };

  const NameAge = () => {
    if (status === 'Normal') {
      return (
        <span className="name-age">
          {moment.unix(expiresTime)?.diff(moment(), 'years')}
        </span>
      );
    }
    return null;
  };

  let tooltipArray = [];

  if (expiresTime > 0) {
    switch (status) {
      case 'Normal':
      case 'Grace':
        tooltipArray[0] = {
          label: t('c.registrationTime'),
          unixTime: registrationTime,
        };
        tooltipArray[1] = { label: t('c.expiresTime'), unixTime: expiresTime };
        tooltipArray[2] = { label: t('c.releaseTime'), unixTime: releaseTime };
        tooltipArray[3] = {
          label: t('c.currentTime'),
          unixTime: moment().unix(),
          current: true,
        };
        break;
      case 'Premium':
      case 'Reopen':
        tooltipArray[0] = {
          label: t('c.registrationTime'),
          unixTime: registrationTime,
        };
        tooltipArray[1] = { label: t('c.expiresTime'), unixTime: expiresTime };
        tooltipArray[2] = { label: t('c.releaseTime'), unixTime: releaseTime };
        tooltipArray[3] = {
          label: t('c.premiumEnd'),
          unixTime: releaseTime + moment.duration(21, 'days').asSeconds(),
        };
        tooltipArray[4] = {
          label: t('c.currentTime'),
          unixTime: moment().unix(),
          current: true,
        };
        break;
      default:
        tooltipArray[0] = {
          label: t('c.relatedTime'),
          unixTime: t('nm.sta.Unknown'),
        };
    }
  } else {
    tooltipArray[0] = {
      label: t('c.relatedTime'),
      unixTime: t('nm.sta.Unknown'),
    };
  }

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            {jsonSortByNumber(tooltipArray, 'unixTime').map((item, index) => {
              return (
                <p
                  key={index}
                  className={
                    'd-flex justify-content-between current-' + item.current ??
                    'false'
                  }
                >
                  <span className="tooltip-time-title me-1">{item.label}:</span>
                  <span className="tooltip-time-text">
                    {typeof item.unixTime === 'number' ? (
                      item.current ? (
                        <Clock format={'YYYY-MM-DD HH:mm:ss'} ticking={true} />
                      ) : (
                        moment.unix(item.unixTime).format('YYYY-MM-DD HH:mm:ss')
                      )
                    ) : (
                      item.unixTime
                    )}
                  </span>
                </p>
              );
            })}
          </Tooltip>
        }
      >
        <span
          className={
            'td-status status-' + status + graceEndingClass + premiumEndingClass
          }
          onClick={() => updateNames([label])}
        >
          <StatusText />
          <NameAge />
        </span>
      </OverlayTrigger>
    </>
  );
};
