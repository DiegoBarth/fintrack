import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'

describe('DropdownMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger and toggles content on click', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })

  it('renders DropdownMenuLabel', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => expect(screen.getByText('My Label')).toBeInTheDocument())
  })

  it('calls onClick when DropdownMenuItem is clicked', async () => {
    const onSelect = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    const actionItem = await screen.findByRole('menuitem', { name: 'Action' })
    fireEvent.click(actionItem)

    expect(onSelect).toHaveBeenCalled()
  })

  it('renders DropdownMenuSeparator', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'A' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'B' })).toBeInTheDocument()
    })
  })

  it('renders DropdownMenuCheckboxItem with checked state', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked onCheckedChange={() => {}}>
            Checked item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Checked item' })).toBeInTheDocument()
  })

  it('renders DropdownMenuRadioGroup and RadioItem', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="one" onValueChange={() => {}}>
            <DropdownMenuRadioItem value="one">One</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="two">Two</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => {
      expect(screen.getByRole('menuitemradio', { name: 'One' })).toBeInTheDocument()
      expect(screen.getByRole('menuitemradio', { name: 'Two' })).toBeInTheDocument()
    })
  })

  it('renders DropdownMenuShortcut inside item', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Save
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('⌘S')).toBeInTheDocument()
    })
  })

  it('renders DropdownMenuSub with SubTrigger and SubContent', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('menuitem', { name: 'Submenu' })).toBeInTheDocument()
  })

  it('applies inset class when inset prop is true on DropdownMenuItem', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset className="custom-inset">
            Inset item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }))
    const item = await screen.findByRole('menuitem', { name: 'Inset item' })
    expect(item).toHaveClass('pl-8')
  })
})
