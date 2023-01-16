import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { t } from "i18next";

export const DelCell = (props) => {
  const { label, removeName, index } = props;

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{t("tb.td.tips.del", { label: label })}</Tooltip>}
    >
      <button
        type="button"
        className="btn-plain btn-sub"
        onClick={() => removeName(index)}
      >
        <FontAwesomeIcon icon={faCircleXmark} />
      </button>
    </OverlayTrigger>
  );
};
