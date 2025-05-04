
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={props.id} className="form-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          {leftIcon && <div className="input-icon input-icon-left">{leftIcon}</div>}
          <input
            type={type}
            className={`form-input ${leftIcon ? 'with-left-icon' : ''} ${rightIcon ? 'with-right-icon' : ''} ${error ? 'input-error' : ''} ${className || ""}`}
            ref={ref}
            {...props}
          />
          {rightIcon && <div className="input-icon input-icon-right">{rightIcon}</div>}
        </div>
        {error ? (
          <div className="input-error-message">{error}</div>
        ) : helperText ? (
          <div className="input-helper-text">{helperText}</div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
