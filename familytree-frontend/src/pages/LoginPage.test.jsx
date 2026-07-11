import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../api/auth'
import { useAuthStore } from '../store/authStore'
import LoginPage from './LoginPage'

vi.mock('../api/auth')

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, refreshToken: null, userId: null, username: null })
    vi.clearAllMocks()
  })

  it('logs in successfully and stores the session', async () => {
    authApi.login.mockResolvedValue({ access: 'access-token', refresh: 'refresh-token' })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Имя пользователя'), 'alice')
    await user.type(screen.getByLabelText('Пароль'), 'secret123')
    await user.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe('access-token')
    })
    expect(useAuthStore.getState().username).toBe('alice')
    expect(authApi.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret123' })
  })

  it('shows an error message on failed login', async () => {
    authApi.login.mockRejectedValue(new Error('invalid credentials'))
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Имя пользователя'), 'alice')
    await user.type(screen.getByLabelText('Пароль'), 'wrong')
    await user.click(screen.getByRole('button', { name: /войти/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/неверный логин/i)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
