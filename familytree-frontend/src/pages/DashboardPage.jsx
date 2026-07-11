import { useEffect, useState } from 'react'
import { createTree, deleteTree, listTrees } from '../api/trees'
import Modal from '../components/Modal'
import TreeCard from '../components/TreeCard'
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const [trees, setTrees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [privacy, setPrivacy] = useState('private')

  const username = useAuthStore((state) => state.username)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    loadTrees()
  }, [])

  async function loadTrees() {
    setLoading(true)
    try {
      const data = await listTrees()
      setTrees(data)
    } catch {
      setError('Не удалось загрузить деревья')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    try {
      await createTree({ name, privacy })
      setName('')
      setPrivacy('private')
      setShowCreate(false)
      await loadTrees()
    } catch {
      setError('Не удалось создать дерево')
    }
  }

  async function handleDelete(treeId) {
    if (!window.confirm('Удалить это дерево?')) return
    try {
      await deleteTree(treeId)
      await loadTrees()
    } catch {
      setError('Не удалось удалить дерево (возможно, вы не владелец)')
    }
  }

  return (
    <div className="dashboard-page">
      <header>
        <h1>Мои деревья{username ? `, ${username}` : ''}</h1>
        <button type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      <button type="button" onClick={() => setShowCreate(true)}>
        Создать дерево
      </button>

      {error && <p role="alert">{error}</p>}

      {showCreate && (
        <Modal title="Создать дерево" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <label htmlFor="tree-name">Название</label>
            <input id="tree-name" value={name} onChange={(e) => setName(e.target.value)} required />

            <label htmlFor="tree-privacy">Приватность</label>
            <select id="tree-privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
              <option value="private">Закрытое</option>
              <option value="link">По ссылке</option>
              <option value="public">Открытое</option>
            </select>

            <button type="submit">Создать</button>
            <button type="button" onClick={() => setShowCreate(false)}>
              Отмена
            </button>
          </form>
        </Modal>
      )}

      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <div className="tree-grid">
          {trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
