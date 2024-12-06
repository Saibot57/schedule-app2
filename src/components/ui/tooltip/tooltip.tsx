// components/ui/tooltip/tooltip.tsx
'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

// Create TooltipProvider even though we don't need it,
// to maintain compatibility with the existing code structure
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Updated TooltipTrigger for compatibility without unused props
export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Define specific prop types for TooltipContent
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Updated TooltipContent with proper typing
export function TooltipContent({ children, className, ...props }: TooltipContentProps) {
  return <div className={className} {...props}>{children}</div>;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX + (rect.width / 2)
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-md whitespace-nowrap transform -translate-x-1/2",
            className
          )}
          style={{ top: position.top, left: position.left }}
        >
          {content}
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 transform border-4 border-transparent border-b-gray-900"
            style={{ width: 0, height: 0 }}
          />
        </div>
      )}
    </div>
  );
}

// Add default export to maintain compatibility
export default Tooltip;
