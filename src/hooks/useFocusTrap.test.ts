import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

describe('useFocusTrap', () => {
   let container: HTMLDivElement;

   beforeEach(() => {
      document.body.innerHTML = '';
      container = document.createElement('div');
      document.body.appendChild(container);
   });

   it('should return the container ref', () => {
      const { result } = renderHook(() => useFocusTrap(false));
      expect(result.current).toBeDefined();
      expect(result.current.current).toBeNull(); // Ref not attached yet
   });

   it('should focus on the first focusable element when activated', () => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      container.appendChild(input1);
      container.appendChild(input2);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;

      rerender({ active: true });

      expect(document.activeElement).toBe(input1);
   });

   it('should NOT focus on a button as the first element', () => {
      const button = document.createElement('button');
      button.textContent = 'Close';
      const input = document.createElement('input');

      container.appendChild(button);
      container.appendChild(input);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;

      rerender({ active: true });

      // Should skip the button and focus on the input
      expect(document.activeElement).toBe(input);
   });

   it('should trap Tab focus within the container', () => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      container.appendChild(input1);
      container.appendChild(input2);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;
      rerender({ active: true });

      input2.focus();

      const tabEvent = new KeyboardEvent('keydown', {
         key: 'Tab',
         bubbles: true,
         cancelable: true
      });

      container.dispatchEvent(tabEvent);

      expect(document.activeElement).toBe(input1);
   });

   it('should trap Shift+Tab focus within the container', () => {
      const input1 = document.createElement('input');
      const input2 = document.createElement('input');
      container.appendChild(input1);
      container.appendChild(input2);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;
      rerender({ active: true });

      input1.focus();

      const shiftTabEvent = new KeyboardEvent('keydown', {
         key: 'Tab',
         shiftKey: true,
         bubbles: true,
         cancelable: true
      });

      container.dispatchEvent(shiftTabEvent);

      expect(document.activeElement).toBe(input2);
   });

   it('should restore focus to the previous element when deactivated', () => {
      const externalButton = document.createElement('button');
      document.body.appendChild(externalButton);
      externalButton.focus();

      const input = document.createElement('input');
      container.appendChild(input);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;

      rerender({ active: true });
      expect(document.activeElement).toBe(input);

      rerender({ active: false });
      expect(document.activeElement).toBe(externalButton);
   });

   it('should do nothing when container ref is null', () => {
      const { rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      // Does not attach ref, should not do anything (no errors)
      expect(() => rerender({ active: true })).not.toThrow();
   });

   it('should ignore disabled elements', () => {
      const button = document.createElement('button');
      button.disabled = true;

      const input = document.createElement('input');

      container.appendChild(button);
      container.appendChild(input);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;
      rerender({ active: true });

      // Should skip disabled button and focus on the input
      expect(document.activeElement).toBe(input);
   });

   it('should ignore elements with tabindex=-1', () => {
      const div = document.createElement('div');
      div.tabIndex = -1;

      const input = document.createElement('input');

      container.appendChild(div);
      container.appendChild(input);

      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;
      rerender({ active: true });

      // Should skip div with tabindex=-1 and focus on the input
      expect(document.activeElement).toBe(input);
   });

   it('should handle an empty container', () => {
      // Container with no focusable elements
      const { result, rerender } = renderHook(({ active }) => useFocusTrap(active), {
         initialProps: { active: false }
      });

      result.current.current = container;

      // Should not throw an error
      expect(() => rerender({ active: true })).not.toThrow();
   });
});