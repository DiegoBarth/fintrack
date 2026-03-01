import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreditCards from '@/components/dashboard/CreditCards'
import type { CreditCardSummary } from '@/types/Dashboard'

vi.mock('@/config/constants', () => ({
  BASE_PATH: '/',
  SWIPE_MIN_DISTANCE_PX: 50,
}))

function createCard(overrides: Partial<CreditCardSummary> = {}): CreditCardSummary {
  return {
    cardName: 'Bradesco',
    image: 'bradesco',
    totalLimit: 10000,
    availableLimit: 7000,
    usedPercentage: 30,
    statementTotal: 3000,
    ...overrides,
  }
}

describe('CreditCards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when cards array is empty', () => {
    const { container } = render(<CreditCards cards={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders section with title Cartões', () => {
    render(<CreditCards cards={[createCard()]} />)
    expect(screen.getByRole('heading', { name: 'Cartões' })).toBeInTheDocument()
  })

  it('shows card counter 1 / 1 for single card', () => {
    render(<CreditCards cards={[createCard()]} />)
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
  })

  it('shows card counter 1 / 2 when two cards and first is active', () => {
    render(<CreditCards cards={[createCard(), createCard({ cardName: 'Nubank', image: 'nubank' })]} />)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('renders card name and formatted values', () => {
    render(<CreditCards cards={[createCard({ cardName: 'Itaú', statementTotal: 1500, availableLimit: 5000 })]} />)
    expect(screen.getByText('Itaú')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('renders image with correct src and alt', () => {
    render(<CreditCards cards={[createCard({ cardName: 'Test Card', image: 'test-img' })]} />)
    const img = screen.getByRole('img', { name: 'Test Card' })
    expect(img).toHaveAttribute('src', '/cards/test-img.jpg')
  })

  it('changes active card when dot is clicked', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    const secondDot = screen.getByRole('button', { name: 'Ir para cartão 2' })
    fireEvent.click(secondDot)
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('next arrow advances to second card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    const buttons = screen.getAllByRole('button')
    const nextArrow = buttons.find(b => b.className.includes('right-10'))
    expect(nextArrow).toBeDefined()
    fireEvent.click(nextArrow!)
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('previous arrow goes back to first card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons.find(b => b.className.includes('right-10'))!)
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    fireEvent.click(buttons.find(b => b.className.includes('left-10'))!)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('previous arrow is disabled on first card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    const prevArrow = screen.getAllByRole('button').find(b => b.className.includes('left-10'))
    expect(prevArrow).toBeDisabled()
  })

  it('next arrow is disabled on last card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ir para cartão 2' }))
    const nextArrow = screen.getAllByRole('button').find(b => b.className.includes('right-10'))
    expect(nextArrow).toBeDisabled()
  })

  it('renders Fatura and Disponível labels', () => {
    render(<CreditCards cards={[createCard()]} />)
    expect(screen.getByText('Fatura:')).toBeInTheDocument()
    expect(screen.getByText('Disponível:')).toBeInTheDocument()
  })

  it('clicking on card changes active card when not dragging', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Card 2'))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('mouse swipe right (drag left) advances to next card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    const container = document.querySelector('.touch-pan-y')
    expect(container).toBeInTheDocument()
    fireEvent.mouseDown(container!, { clientX: 200 })
    fireEvent.mouseMove(container!, { clientX: 140 })
    fireEvent.mouseUp(container!)
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('mouse swipe left (drag right) goes to previous card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ir para cartão 2' }))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    const container = document.querySelector('.touch-pan-y')
    fireEvent.mouseDown(container!, { clientX: 200 })
    fireEvent.mouseMove(container!, { clientX: 260 })
    fireEvent.mouseUp(container!)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('mouseLeave ends drag without changing card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    const container = document.querySelector('.touch-pan-y')
    fireEvent.mouseDown(container!, { clientX: 200 })
    fireEvent.mouseMove(container!, { clientX: 210 })
    fireEvent.mouseLeave(container!)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('swipe below threshold does not change card', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'Card 1' }),
          createCard({ cardName: 'Card 2', image: 'card2' }),
        ]}
      />
    )
    const container = document.querySelector('.touch-pan-y')
    fireEvent.mouseDown(container!, { clientX: 200 })
    fireEvent.mouseMove(container!, { clientX: 190 })
    fireEvent.mouseUp(container!)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('renders three cards and navigates to third', () => {
    render(
      <CreditCards
        cards={[
          createCard({ cardName: 'A' }),
          createCard({ cardName: 'B', image: 'b' }),
          createCard({ cardName: 'C', image: 'c' }),
        ]}
      />
    )
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ir para cartão 3' }))
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
