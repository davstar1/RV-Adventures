import { useRef, useState } from 'react';

const SWIPE_DISTANCE = 44;

export default function useSwipeCaption() {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const touchStartY = useRef(null);

  const resetCaption = () => setCaptionExpanded(false);
  const toggleCaption = () => setCaptionExpanded(expanded => !expanded);

  const swipeHandlers = {
    onTouchStart: event => {
      const interactive = event.target?.closest?.('input, textarea, select, a, .photo-comments, button:not(.caption-sheet-handle)');
      touchStartY.current = interactive ? null : event.touches[0]?.clientY ?? null;
    },
    onTouchEnd: event => {
      if (touchStartY.current === null) return;

      const endY = event.changedTouches[0]?.clientY;
      const distance = typeof endY === 'number' ? endY - touchStartY.current : 0;
      touchStartY.current = null;

      if (distance <= -SWIPE_DISTANCE) {
        setCaptionExpanded(true);
        return;
      }

      const scrollArea = event.currentTarget.querySelector('[data-caption-scroll]');
      if (distance >= SWIPE_DISTANCE && (!scrollArea || scrollArea.scrollTop <= 1)) {
        setCaptionExpanded(false);
      }
    },
  };

  return { captionExpanded, resetCaption, swipeHandlers, toggleCaption };
}
