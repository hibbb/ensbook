import React from 'react';
import { Toast } from 'bootstrap/dist/js/bootstrap.bundle.min';

class MessageToasts extends React.Component {
  componentDidMount() {
    this.props.onRef(this); // call parent component
  }

  messageShow(id, message, autohide = 'true', delay = '5000') {
    const toastElement = document.getElementById(id);
    toastElement.setAttribute('data-bs-autohide', autohide);
    toastElement.setAttribute('data-bs-delay', delay);
    toastElement.firstElementChild.firstElementChild.innerHTML = message;
    const messageToast = new Toast(toastElement);
    messageToast.show();
  }

  render() {
    const zIndex = { zIndex: 11 };
    const toastArray = [
      // 'nameNormalizeError',
      // 'register00',
      // 'register10',
      // 'register11',
      // 'register20',
      // 'register31',
      'setAndStoreNameInfo',
    ];

    return (
      <div aria-live="polite" aria-atomic="true" style={zIndex}>
        <div
          id="messageContainer"
          className="toast-container position-fixed bottom-0 end-0 p-3"
        >
          {toastArray.map((toastId) => (
            <div
              id={toastId}
              key={toastId}
              className="toast align-items-center msg-default border-0"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="d-flex">
                <div className="toast-body" />
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  data-bs-dismiss="toast"
                  aria-label="Close"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default MessageToasts;
