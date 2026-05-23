
import React from 'react';

const RadioGroupContext = React.createContext<{ value?: string; onValueChange: (value: string) => void }>({
  onValueChange: () => {},
});

const RadioGroup: React.FC<React.PropsWithChildren<{ className?: string; value?: string; onValueChange: (value: string) => void }>> = ({
  className,
  value,
  onValueChange,
  children,
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    return (
      <input
        type="radio"
        ref={ref}
        checked={context.value === props.value}
        onChange={(e) => context.onValueChange(e.target.value)}
        className={`aspect-square h-4 w-4 rounded-full border border-gray-300 text-[#018a83] ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#018a83] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };