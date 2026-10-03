import React from 'react';

export default function Toast({ show, message }) {
  return (
    <div className={`toast ${show ? 'show' : ''}`} role="status">
      {message}
    </div>
  );
}
