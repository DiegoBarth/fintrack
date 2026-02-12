import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
   it('should render children correctly', () => {
      render(<Button>Click me</Button>)

      expect(screen.getByText('Click me')).toBeInTheDocument()
   })

   it('should render as a button by default', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
   })

   it('should call onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
   })

   it('should accept destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
   })

   it('should accept outline variant', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
   })

   it('should accept ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
   })

   it('should accept link variant', () => {
      render(<Button variant="link">Link</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('underline-offset-4')
   })

   it('should accept size sm', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8')
   })

   it('should accept size lg', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
   })

   it('should accept size icon', () => {
      render(<Button size="icon">🔍</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
      expect(button).toHaveClass('w-9')
   })

   it('should be disabled when disabled=true', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50')
   })

   it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
   })

   it('should accept submit type', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
   })

   it('should accept button type', () => {
      render(<Button type="button">Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
   })

   it('should not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(
         <Button disabled onClick={handleClick}>
            Disabled
         </Button>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
   })

   it('should have visible focus with focus-visible', () => {
      render(<Button>Focus</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:ring-1')
   })

   it('should apply default variant when not specified', () => {
      render(<Button>Default</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
   })
})