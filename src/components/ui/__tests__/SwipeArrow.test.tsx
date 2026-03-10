import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SwipeArrow } from '@/components/ui/SwipeArrow'

describe('SwipeArrow', () => {
  it('returns null when direction is null', () => {
    const { container } = render(<SwipeArrow direction={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders ChevronLeft when direction is left', () => {
    render(<SwipeArrow direction="left" />)

    const wrapper = document.querySelector('.fixed.z-\\[9999\\]')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('left-4')

    const animated = wrapper?.firstChild as HTMLElement
    expect(animated).toHaveStyle({ '--swipe-x': '-24px', '--swipe-y': '0' })
  })

  it('renders ChevronRight when direction is right', () => {
    render(<SwipeArrow direction="right" />)

    const wrapper = document.querySelector('.fixed.z-\\[9999\\]')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('right-4')

    const animated = wrapper?.firstChild as HTMLElement
    expect(animated).toHaveStyle({ '--swipe-x': '24px', '--swipe-y': '0' })
  })

  it('renders RefreshCcw when direction is up', () => {
    render(<SwipeArrow direction="up" />)

    const wrapper = document.querySelector('.fixed.z-\\[9999\\]')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('top-4')
    expect(wrapper).toHaveClass('left-1/2')

    const animated = wrapper?.firstChild as HTMLElement
    expect(animated).toHaveStyle({ '--swipe-x': '0', '--swipe-y': '-24px' })
  })

  it('applies correct position classes for left', () => {
    const { container } = render(<SwipeArrow direction="left" />)
    const el = container.querySelector('.left-4')
    expect(el).toBeInTheDocument()
    expect(el).not.toHaveClass('right-4')
  })

  it('applies correct position classes for right', () => {
    const { container } = render(<SwipeArrow direction="right" />)
    const el = container.querySelector('.right-4')
    expect(el).toBeInTheDocument()
  })

  it('applies top-4 and centered positioning for up direction', () => {
    const { container } = render(<SwipeArrow direction="up" />)
    const el = container.querySelector('.top-4.left-1\\/2')
    expect(el).toBeInTheDocument()
  })
})