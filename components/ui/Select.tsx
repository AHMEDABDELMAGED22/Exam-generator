
import React, { useState, useContext, createContext, useRef, useEffect } from 'react';

const SelectContext = createContext<{
  value?: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>({
  onValueChange: () => {},
  isOpen: false,
  setIsOpen: () => {},
});

const Select: React.FC<React.PropsWithChildren<{ value?: string; onValueChange: (value: string) => void }>> = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative" ref={containerRef}>{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#018a83] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
        <svg className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";


const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ children, placeholder }, ref) => {
  return <span ref={ref}>{children || placeholder}</span>;
});
SelectValue.displayName = 'SelectValue';


const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useContext(SelectContext);
    if (!isOpen) return null;
    return (
      <div
        ref={ref}
        className={`absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, children, value, ...props }, ref) => {
    const { onValueChange, setIsOpen } = useContext(SelectContext);
    return (
      <div
        ref={ref}
        onClick={() => {
          onValueChange(value);
          setIsOpen(false);
        }}
        className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none hover:bg-gray-100 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";


export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };