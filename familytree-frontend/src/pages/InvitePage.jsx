import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { acceptInvite } from '../api/trees'
import { useAuthStore } from '../store/authStore'

export default function InvitePage() {
  const { token } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = { pathname: `/invite/${token}` }

  async function handleJoin() {
    setError('')
    setSubmitting(true)
    try {
      const data = await acceptInvite(token)
      navigate(`/trees/${data.tree_id}`, { replace: true })
    } catch {
      setError('Приглашение недействительно или уже использовано')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="invite-page">
      <h1>Приглашение в семейное дерево</h1>

      {!accessToken ? (
        <>
          <p>Чтобы присоединиться, сначала войдите или зарегистрируйтесь.</p>
          <div className="invite-page-actions">
            <Link to="/login" state={{ from }}>
              Войти
            </Link>
            <Link to="/register" state={{ from }}>
              Зарегистрироваться
            </Link>
          </div>
        </>
      ) : (
        <>
          {error && <p role="alert">{error}</p>}
          <button type="button" onClick={handleJoin} disabled={submitting}>
            {submitting ? 'Присоединяемся…' : 'Присоединиться'}
          </button>
        </>
      )}
    </div>
  )
}
