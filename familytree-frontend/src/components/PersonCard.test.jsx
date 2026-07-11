import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PersonCard from './PersonCard'

describe('PersonCard', () => {
  const person = {
    id: 1,
    first_name: 'Anna',
    last_name: 'Ivanova',
    birth_date: '1950-05-01',
    death_date: '2020-01-01',
    bio: 'A short biography excerpt.',
    photo: null,
  }

  it('renders name, year range, and a photo fallback when there is no photo', () => {
    render(<PersonCard person={person} />)

    expect(screen.getByText('Anna Ivanova')).toBeInTheDocument()
    expect(screen.getByText('1950 – 2020')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders a photo when one is provided', () => {
    render(<PersonCard person={{ ...person, photo: '/media/persons/anna.jpg' }} />)

    expect(screen.getByRole('img', { name: 'Anna Ivanova' })).toHaveAttribute(
      'src',
      '/media/persons/anna.jpg',
    )
  })

  it('calls onEdit and onDelete with the right arguments when clicked', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(<PersonCard person={person} onEdit={onEdit} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Редактировать' }))
    expect(onEdit).toHaveBeenCalledWith(person)

    await user.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
