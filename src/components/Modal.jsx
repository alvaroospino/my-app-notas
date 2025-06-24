// src/components/ConfirmModal.jsx
import React from 'react';
import './Modal.css';

function Modal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onConfirm}>Sí</button>
          <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
