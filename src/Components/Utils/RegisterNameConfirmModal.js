// import React from 'react';
// import { Modal, Button } from 'react-bootstrap';

// function RegisterNameConfirmModal(props) {
//   const {show, onHide, registerName, label, messages, t} = props
//   return (
//     <Modal
//       show={show}
//       onHide={onHide}
//       size="lg"
//       backdrop="static" 
//       keyboard={false}
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>{t('modal.title')}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <h4>Centered Modal</h4>
//         {
//           messages.map((item, index)=>{
//             return (<p key={index}>{item}</p>)
//           })
//         }
//       </Modal.Body>
//       <Modal.Footer>
//         <Button onClick={()=>registerName(label)}>Close</Button>
//       </Modal.Footer>
//     </Modal>
//   )
// }

// export default RegisterNameConfirmModal

import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ChevronRight } from 'react-bootstrap-icons';



const RegisterNameConfirmModal = (props) => {
  const { show, onHide, label, registerName, updateNameByLabel, updateBalance, messages, t } = props
  // const [ action, setAction ] = useState("nothing");
  const action = messages[0]?.text ?? "noAction"

  const ActionButton = () => {
    function regFinished () {
      onHide()
      updateNameByLabel(label, true)
      updateBalance()
    }

    if (action === 'regStarted') {
      return <Button variant="secondary" disabled>{t('nm.sta.Registering')}</Button>
    }
    if (action === 'regFailed' || action === 'regSucceeded') {
      return <Button variant="primary" onClick={()=>regFinished()}>{t('c.back')}</Button>
    }
    return (
        <>
          <Button variant="secondary" onClick={onHide}>{t('c.cancel')}</Button>
          <Button variant="primary" onClick={()=>registerName(label)}>{t('c.confirm')}</Button>
        </>
      )
  }

  const MessageItem = (props) => {
    return (
      <p className="modal-message">
        <ChevronRight className="modal-message-icon" />
        <span dangerouslySetInnerHTML={{ __html: props.text }} />
      </p>
    )
  }

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>{ t('modal.title', { label: label}) }</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="modal-tip">{t('modal.reg.tip1')}</p>
        {
          messages.slice(1).map((item, index) => <MessageItem key={index} text={item.text} />)
        }
      </Modal.Body>
      <Modal.Footer>
        <ActionButton />    
      </Modal.Footer>
    </Modal>
  )
}

export default RegisterNameConfirmModal
