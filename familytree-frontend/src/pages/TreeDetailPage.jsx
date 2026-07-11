import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteRelationship } from '../api/relationships'
import { fullTree } from '../api/trees'
import FamilyTreeGraph from '../components/FamilyTreeGraph'
import PersonModal from '../components/PersonModal'
import RelationshipModal from '../components/RelationshipModal'

export default function TreeDetailPage() {
  const { treeId } = useParams()
  const [persons, setPersons] = useState([])
  const [relationships, setRelationships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingPerson, setEditingPerson] = useState(null)
  const [showPersonModal, setShowPersonModal] = useState(false)
  const [showRelationshipModal, setShowRelationshipModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fullTree(treeId)
      setPersons(data.persons)
      setRelationships(data.relationships)
    } catch {
      setError('Не удалось загрузить дерево')
    } finally {
      setLoading(false)
    }
  }, [treeId])

  useEffect(() => {
    load()
  }, [load])

  function openAddPerson() {
    setEditingPerson(null)
    setShowPersonModal(true)
  }

  function handleNodeClick(personId) {
    const person = persons.find((p) => String(p.id) === personId)
    if (!person) return
    setEditingPerson(person)
    setShowPersonModal(true)
  }

  async function handleEdgeClick(relationshipId) {
    if (!window.confirm('Удалить эту связь?')) return
    try {
      await deleteRelationship(treeId, relationshipId)
      await load()
    } catch {
      setError('Не удалось удалить связь')
    }
  }

  function handlePersonModalClose() {
    setShowPersonModal(false)
    setEditingPerson(null)
  }

  async function handlePersonSaved() {
    handlePersonModalClose()
    await load()
  }

  async function handlePersonDeleted() {
    handlePersonModalClose()
    await load()
  }

  return (
    <div className="tree-detail-page">
      <header>
        <Link to="/dashboard">← Мои деревья</Link>
        <Link to={`/trees/${treeId}/settings`}>Настройки</Link>
      </header>

      <div className="tree-detail-toolbar">
        <button type="button" onClick={openAddPerson}>
          + Добавить человека
        </button>
        <button type="button" onClick={() => setShowRelationshipModal(true)} disabled={persons.length < 2}>
          + Добавить связь
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <FamilyTreeGraph
          persons={persons}
          relationships={relationships}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
        />
      )}

      {showPersonModal && (
        <PersonModal
          treeId={treeId}
          person={editingPerson}
          onClose={handlePersonModalClose}
          onSaved={handlePersonSaved}
          onDeleted={handlePersonDeleted}
        />
      )}

      {showRelationshipModal && (
        <RelationshipModal
          treeId={treeId}
          persons={persons}
          relationships={relationships}
          onClose={() => setShowRelationshipModal(false)}
          onSaved={async () => {
            setShowRelationshipModal(false)
            await load()
          }}
        />
      )}
    </div>
  )
}
