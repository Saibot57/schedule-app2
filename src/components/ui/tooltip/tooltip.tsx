'use client';

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  delayMs?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ 
  children, 
  content, 
  className,
  delayMs = 200,
  side = 'top'
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = (e: MouseEvent) => {
    if (!tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Get cursor position
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    // Default offset from cursor
    const offset = 10;
    
    // Calculate initial position based on cursor
    let top = cursorY + scrollY + offset;
    let left = cursorX + scrollX + offset;

    // Prevent tooltip from going off screen
    const padding = 5;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust if tooltip would go off right edge
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = cursorX + scrollX - tooltipRect.width - offset;
    }

    // Adjust if tooltip would go off bottom edge
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = cursorY + scrollY - tooltipRect.height - offset;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Use the event from mouseenter for initial position
      updatePosition(e.nativeEvent);
    }, delayMs);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isVisible) {
      updatePosition(e.nativeEvent);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Create tooltip portal
  const tooltipPortal = isVisible && createPortal(
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-pre-line",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
        pointerEvents: 'none', // Prevent tooltip from interfering with mouse events
      }}
    >
      {content}
    </div>,
    document.body
  );

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
      {tooltipPortal}
    </div>
  );
}

export default Tooltip;