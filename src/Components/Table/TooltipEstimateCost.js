import React from "react";
import { Spinner } from "react-bootstrap";
import { t } from "i18next";

class TooltipEstimateCost extends React.Component {
  render() {
    const { estimating } = this.props;

    if (estimating.status === "in") {
      return (
        <>
          <p>{t(estimating.title)}</p>
          <div>
            <Spinner
              animation="border"
              variant="light"
              className="spinner-acting"
            />
          </div>
        </>
      );
    }
    if (estimating.status === "after") {
      return (
        <>
          <p>{t(estimating.title)}</p>
          <div>{"≈ " + estimating.cost.slice(0, 7) + " ETH"}</div>
        </>
      );
    }
    return t(estimating.title);
  }
}

export default TooltipEstimateCost;
