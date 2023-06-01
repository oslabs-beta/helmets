import React, { useEffect } from 'react';
import './about.scss';

function Modal(props) {
  if (!props.show) return null;

  // now we can close modal with the escape key
  const closeOnEscapeKeyDown = (event) => {
    if ((event.charCode || event.keyCode) === 27) {
      props.onClose();
    }
  };

  useEffect(() => {
    document.body.addEventListener('keydown', closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
    };
  }, []);

  return (
    <div className="modal" onClick={props.onClose}>
      <div className="about-content" onClick={(e) => e.stopPropagation()}>
        <h4>About Helmets</h4>
        <p>Helmets is ... </p>
        <button className="close-button" onClick={props.onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;
