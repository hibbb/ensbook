import React from 'react';
import { Spinner } from 'react-bootstrap';

class TooltipEstimateCost extends React.Component {

  render() {
    const { estimating, t } = this.props
    
    if (estimating.status === "in") {
      return (
        <>
          <p>
            {t(estimating.title)}
          </p>
          <div>
            <Spinner animation="border" variant="light" className="ms-2 estimating" />
          </div>
        </>
      )
    }
    if (estimating.status === "after") {
      return (
        <>
          <p>
            {t(estimating.title)}
          </p>
          <div>
            { '≈ ' + estimating.cost.slice(0, 7) + ' ETH' }
          </div>
        </>
      )
    }
    return t(estimating.title)
  }
}

export default TooltipEstimateCost