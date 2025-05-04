
import React from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`form-label ${className || ""}`}
        {...props}
      >
        {children}
        {required && <span className="label-required">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
