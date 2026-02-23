import { useState, useCallback, useEffect } from 'react';

export function useResizablePanels(initialLeftWidth = 320, initialRightWidth = 280) {
  const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeftWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(initialRightWidth);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const handleMouseMoveLeft = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setLeftPanelWidth(newWidth);
    }
  }, [isResizingLeft]);

  const handleMouseMoveRight = useCallback((e: MouseEvent) => {
    if (isResizingRight) {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(600, window.innerWidth - e.clientX));
      setRightPanelWidth(newWidth);
    }
  }, [isResizingRight]);

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMoveLeft as any);
      document.addEventListener('mousemove', handleMouseMoveRight as any);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveLeft as any);
        document.removeEventListener('mousemove', handleMouseMoveRight as any);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizingLeft, isResizingRight, handleMouseMoveLeft, handleMouseMoveRight, handleMouseUp]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    isResizingLeft,
    isResizingRight,
    setIsResizingLeft,
    setIsResizingRight,
  };
}
