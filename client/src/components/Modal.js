import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // If the modal isn't open, render nothing
  if (!isOpen) {
    return null;
  }

  // This stops the modal from closing when you click inside the modal box
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // The "onClick={onClose}" creates the dark background (overlay)
    // Clicking the background will close the modal
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      {/* This is the white modal box */}
      <div
        onClick={handleModalContentClick}
        className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times; {/* This is an 'X' icon */}
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4">
          {children} {/* This is where our form will go */}
        </div>
      </div>
    </div>
  );
}

export default Modal;