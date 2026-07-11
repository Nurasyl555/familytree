import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as treesApi from '../api/trees'
import DashboardPage from './DashboardPage'

vi.mock('../api/trees')

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trees returned by the API', async () => {
    treesApi.listTrees.mockResolvedValue([
      { id: 1, name: 'Семья Ивановых', privacy: 'private', share_token: 'abc' },
      { id: 2, name: 'Семья Петровых', privacy: 'public', share_token: 'def' },
    ])

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Семья Ивановых')).toBeInTheDocument()
    expect(screen.getByText('Семья Петровых')).toBeInTheDocument()
  })

  it('shows an error message when trees fail to load', async () => {
    treesApi.listTrees.mockRejectedValue(new Error('network error'))

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(/не удалось загрузить/i)
  })
})
