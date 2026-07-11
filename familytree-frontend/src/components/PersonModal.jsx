import { useState } from 'react'
import { createPerson, deletePerson, updatePerson } from '../api/persons'
import Modal from './Modal'
import PersonForm from './PersonForm'

export default function PersonModal({ treeId, person, onClose, onSaved, onDeleted }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(person?.id)

  async function handleSubmit(data) {
    setSubmitting(true)
    setError('')
    try {
      if (isEdit) {
        await updatePerson(treeId, person.id, data)
      } else {
        await createPerson(treeId, data)
      }
      onSaved()
    } catch {
      setError('Не удалось сохранить человека')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(personId) {
    if (!window.confirm('Удалить этого человека? Все связи с ним также будут удалены.')) return
    setSubmitting(true)
    setError('')
    try {
      await deletePerson(treeId, personId)
      onDeleted()
    } catch {
      setError('Не удалось удалить')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Редактировать человека' : 'Добавить человека'} onClose={onClose}>
      {error && <p role="alert">{error}</p>}
      <PersonForm
        initialPerson={person}
        onSubmit={handleSubmit}
        onCancel={onClose}
        onDelete={isEdit ? handleDelete : undefined}
        submitting={submitting}
      />
    </Modal>
  )
}
