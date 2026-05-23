
import React from 'react';

// Using arbitrary values to match the specific hex codes from the CSS
const variantClasses = {
  default: 'bg-[#018a83] text-white hover:bg-[#026d67] focus-visible:ring-[#018a83]',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400',
};

const sizeClasses = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1 text-xs',
  lg: 'px-8 py-3 text-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };