import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';

interface SwipeableLayoutProps {
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * SwipeableLayout - Enables Instagram-like swipe navigation between main sections
 * Wrap your page components with this to enable swipe gestures
 */
const SwipeableLayout: React.FC<SwipeableLayoutProps> = ({ children, disabled = false }) => {
  const { navigateToNext, navigateToPrevious, canSwipeNext, canSwipePrevious } = useSwipeNavigation();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!disabled && canSwipeNext) {
        navigateToNext();
      }
    },
    onSwipedRight: () => {
      if (!disabled && canSwipePrevious) {
        navigateToPrevious();
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: false, // Disable mouse tracking, only touch gestures
    trackTouch: true,
    delta: 50, // Minimum swipe distance (px) to trigger navigation
  });

  return (
    <div {...handlers} className="h-full">
      {children}
    </div>
  );
};

export default SwipeableLayout;
