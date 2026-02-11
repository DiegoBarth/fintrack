import { useEffect, useRef } from 'react';

/**
 * Hook to implement Focus Trap in modals and dialogs.
 * * Accessibility (a11y):
 * - Prevents the Tab key from navigating outside the modal.
 * - Cycles focus between focusable elements within the container.
 * - Restores focus to the previously focused element when the modal closes.
 * * WCAG 2.1: Success Criterion 2.4.3 (Focus Order)
 * * @param isActive - Whether the trap is active (modal is open).
 * @returns A Ref to attach to the modal container.
 * * @example
 * const trapRef = useFocusTrap(isOpen);
 * return <div ref={trapRef}>...</div>
 */
export function useFocusTrap(isActive: boolean) {
   const containerRef = useRef<HTMLDivElement>(null);
   const previousActiveElement = useRef<HTMLElement | null>(null);

   useEffect(() => {
      if (!isActive) return;

      // Stores the element that had focus before the modal opened
      previousActiveElement.current = document.activeElement as HTMLElement;

      const container = containerRef.current;
      if (!container) return;

      // Focusable elements
      const focusableSelector =
         '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      // Focuses the first focusable element within the modal
      const firstFocusable = container.querySelector<HTMLElement>(focusableSelector);
      firstFocusable?.focus();

      /**
       * Keyboard handler for focus cycling.
       * * Behavior:
       * - Tab: Moves to the next element.
       * - Shift+Tab: Moves to the previous element.
       * - Last element + Tab: Loops back to the first element.
       * - First element + Shift+Tab: Loops back to the last element.
       */
      function handleKeyDown(e: KeyboardEvent) {
         if (e.key !== 'Tab' || !container) return;

         const focusableElements = Array.from(
            container.querySelectorAll<HTMLElement>(focusableSelector)
         );

         if (focusableElements.length === 0) return;

         const firstElement = focusableElements[0];
         const lastElement = focusableElements[focusableElements.length - 1];

         // Shift + Tab on the first element -> moves focus to the last element
         if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
            return;
         }

         // Tab on the last element -> moves focus back to the first element
         if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
            return;
         }
      }

      document.addEventListener('keydown', handleKeyDown);

      // Cleanup: restores focus to the previously focused element
      return () => {
         document.removeEventListener('keydown', handleKeyDown);
         previousActiveElement.current?.focus();
      };
   }, [isActive]);

   return containerRef;
}