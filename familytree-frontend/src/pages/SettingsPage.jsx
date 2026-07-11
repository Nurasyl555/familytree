import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { generateInvite } from '../api/trees'

export default function SettingsPage() {
  const { treeId } = useParams()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('reader')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleInvite(event) {
    event.preventDefault()
    setError('')
    setCopied(false)
    setSubmitting(true)
    try {
      const data = await generateInvite(treeId, { role, email })
      setInviteLink(`${window.location.origin}/invite/${data.token}`)
    } catch {
      setError('Не удалось создать приглашение (только владелец дерева может приглашать)')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
  }

  return (
    <div className="settings-page">
      <header>
        <Link to={`/trees/${treeId}`}>← Назад к дереву</Link>
        <h1>Настройки дерева</h1>
      </header>

      <section>
        <h2>Пригласить участника</h2>
        <form onSubmit={handleInvite}>
          <label htmlFor="invite-email">Email (необязательно)</label>
          <input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label htmlFor="invite-role">Роль</label>
          <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="reader">Читатель</option>
            <option value="editor">Редактор</option>
            <option value="owner">Владелец</option>
          </select>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={submitting}>
            Создать приглашение
          </button>
        </form>

        {inviteLink && (
          <div className="invite-link-box">
            <input type="text" readOnly value={inviteLink} />
            <button type="button" onClick={handleCopy}>
              {copied ? 'Скопировано!' : 'Скопировать ссылку'}
            </button>
          </div>
        )}
      </section>

      <section>
        <h2>Участники</h2>
        <p className="placeholder-note">
          Список участников недоступен: на бэкенде пока нет эндпоинта для получения списка членов дерева с их
          ролями (например, GET /api/trees/{treeId}/members/). Появится, когда такой эндпоинт будет реализован.
        </p>
      </section>
    </div>
  )
}
