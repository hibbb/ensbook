import React from 'react';
import { t } from 'i18next';

const RegisterNamesConfirmModal = (props) => {
  const { registerNames } = props
  return (
    <div className="modal fade" id="registerNamesConfirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="registerNamesConfirmModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="registerNamesConfirmModalLabel">{ t('modal.title') }</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            { t('modal.regAll') }
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">{ t('c.cancel') }</button>
            <button type="button" className="btn btn-primary"  data-bs-dismiss="modal" 
            onClick={()=>registerNames()}>{ t('c.confirm') }</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterNamesConfirmModal

