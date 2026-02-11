import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryCard } from '@/components/home/SummaryCard'

describe('SummaryCard', () => {
   it('should render title and formatted amount', () => {
      render(
         <SummaryCard
            title="Income"
            amount={1234.56}
            color="#10b981"
         />
      )

      expect(screen.getByText('Income')).toBeInTheDocument()
      expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument()
   })

   it('should apply custom color to the amount', () => {
      render(
         <SummaryCard
            title="Expenses"
            amount={500}
            color="#ef4444"
         />
      )

      const amount = screen.getByText('R$ 500,00')
      expect(amount).toHaveStyle({ color: '#ef4444' })
   })

   it('should apply border with the provided color', () => {
      const { container } = render(
         <SummaryCard
            title="Balance"
            amount={1000}
            color="#3b82f6"
         />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveStyle({ borderLeft: '5px solid #3b82f6' })
   })

   it('should show skeleton when isLoading=true', () => {
      render(
         <SummaryCard
            title="Balance"
            amount={1000}
            color="#3b82f6"
            isLoading={true}
         />
      )

      expect(screen.getByText('Balance')).toBeInTheDocument()

      // Amount should not appear when loading
      expect(screen.queryByText('R$ 1.000,00')).not.toBeInTheDocument()

      // Skeleton should be present
      const skeleton = document.querySelector('.h-6.w-24')
      expect(skeleton).toBeInTheDocument()
   })

   it('should render icon when provided', () => {
      const TestIcon = <span data-testid="test-icon">💰</span>

      render(
         <SummaryCard
            title="Balance"
            amount={2000}
            color="#10b981"
            icon={TestIcon}
         />
      )

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
   })

   it('should apply background color to the icon container', () => {
      const TestIcon = <span>💰</span>

      const { container } = render(
         <SummaryCard
            title="Income"
            amount={5000}
            color="#10b981"
            icon={TestIcon}
         />
      )

      const iconContainer = container.querySelector('.h-8.w-8')
      expect(iconContainer).toHaveStyle({ backgroundColor: '#10b98120' })
   })

   it('should not render icon container when icon is not provided', () => {
      const { container } = render(
         <SummaryCard
            title="Total"
            amount={3000}
            color="#10b981"
         />
      )

      const iconContainer = container.querySelector('.h-8.w-8')
      expect(iconContainer).not.toBeInTheDocument()
   })

   it('should format negative amounts correctly', () => {
      render(
         <SummaryCard
            title="Deficit"
            amount={-500.75}
            color="#ef4444"
         />
      )

      expect(screen.getByText('-R$ 500,75')).toBeInTheDocument()
   })

   it('should format zero correctly', () => {
      render(
         <SummaryCard
            title="Pending"
            amount={0}
            color="#6b7280"
         />
      )

      expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
   })

   it('should format large amounts correctly', () => {
      render(
         <SummaryCard
            title="Annual Total"
            amount={1000000}
            color="#10b981"
         />
      )

      expect(screen.getByText('R$ 1.000.000,00')).toBeInTheDocument()
   })

   it('should have transition and hover classes', () => {
      const { container } = render(
         <SummaryCard
            title="Revenue"
            amount={1000}
            color="#10b981"
         />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('hover:shadow-md')
   })

   it('should render title with muted style', () => {
      render(
         <SummaryCard
            title="Total Income"
            amount={5000}
            color="#10b981"
         />
      )

      const title = screen.getByText('Total Income')
      expect(title).toHaveClass('text-muted-foreground')
   })
})