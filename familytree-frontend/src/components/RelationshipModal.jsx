import { useState } from 'react'
import { createRelationship } from '../api/relationships'
import { RELATIONSHIP_LABELS } from './FamilyTreeGraph'
import Modal from './Modal'

export default function RelationshipModal({ treeId, persons, relationships, onClose, onSaved }) {
  const [personFrom, setPersonFrom] = useState('')
  const [personTo, setPersonTo] = useState('')
  const [relationshipType, setRelationshipType] = useState('parent')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!personFrom || !personTo) {
      setError('Выберите обоих людей')
      return
    }
    if (personFrom === personTo) {
      setError('Нельзя связать человека с самим собой')
      return
    }

    const duplicate = relationships.some(
      (r) =>
        String(r.person_from) === personFrom &&
        String(r.person_to) === personTo &&
        r.relationship_type === relationshipType,
    )
    if (duplicate) {
      setError('Такая связь уже существует')
      return
    }

    setSubmitting(true)
    try {
      await createRelationship(treeId, {
        person_from: Number(personFrom),
        person_to: Number(personTo),
        relationship_type: relationshipType,
      })
      onSaved()
    } catch {
      setError('Не удалось создать связь')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Добавить связь" onClose={onClose}>
      <form onSubmit={handleSubmit} className="relationship-form">
        <label htmlFor="rel-from">Человек</label>
        <select id="rel-from" value={personFrom} onChange={(e) => setPersonFrom(e.target.value)} required>
          <option value="" disabled>
            Выберите человека
          </option>
          {persons.map((person) => (
            <option key={person.id} value={person.id}>
              {person.first_name} {person.last_name}
            </option>
          ))}
        </select>

        <label htmlFor="rel-type">Тип связи</label>
        <select id="rel-type" value={relationshipType} onChange={(e) => setRelationshipType(e.target.value)}>
          {Object.entries(RELATIONSHIP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label htmlFor="rel-to">относится к</label>
        <select id="rel-to" value={personTo} onChange={(e) => setPersonTo(e.target.value)} required>
          <option value="" disabled>
            Выберите человека
          </option>
          {persons
            .filter((person) => String(person.id) !== personFrom)
            .map((person) => (
              <option key={person.id} value={person.id}>
                {person.first_name} {person.last_name}
              </option>
            ))}
        </select>

        {error && <p role="alert">{error}</p>}

        <div className="person-form-actions">
          <button type="submit" disabled={submitting}>
            Добавить связь
          </button>
          <button type="button" onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  )
}
