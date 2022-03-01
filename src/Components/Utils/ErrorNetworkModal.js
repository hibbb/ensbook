import React from 'react';

const ErrorNetworkModal = (props) => {
  const {disconnectApp, t} = props
  return (
    <div className="modal fade" id="errorNetworkModal" data-bs-backdrop="static" 
    data-bs-keyboard="false" tabIndex="-1" aria-labelledby="errorNetworkModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="errorNetworkModalLabel">{t('modal.errorNetwork.title')}</h5>
          </div>
          <div className="modal-body">
            {t('modal.errorNetwork.text')}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" 
              data-bs-dismiss="modal"
              onClick={()=>disconnectApp()}
            >
              {t('c.disconnect')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorNetworkModal

