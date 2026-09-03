import React from 'react';

export default function PasswordVisibilityIcon({ hidden }) {
  return (
    <svg
      className="password-visibility-icon"
      viewBox="0 0 32 24"
      role="img"
      aria-hidden="true"
    >
      <path
        className="password-eye-stroke"
        d="M2.5 12S7.2 3.5 16 3.5 29.5 12 29.5 12 24.8 20.5 16 20.5 2.5 12 2.5 12Z"
      />
      <circle className="password-eye-stroke" cx="16" cy="12" r="4.5" />
      {hidden && <path className="password-eye-slash" d="M5 23 27 1" />}
    </svg>
  );
}
