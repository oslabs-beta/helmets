import React from 'react';
import './about.scss';

function Modal(props) {
  return (
    <div className="modal">
      <div className="about-content">
        <h4>About Helmets</h4>
        <p>Helmets is ... </p>
      </div>
      <button className="close-button">Close</button>
    </div>
  );
}

export default Modal;
