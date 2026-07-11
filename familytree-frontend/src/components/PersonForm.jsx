import { useState } from 'react'

function extraDataToRows(extraData) {
  if (!extraData || typeof extraData !== 'object') return []
  return Object.entries(extraData).map(([key, value]) => ({ key, value: String(value) }))
}

function rowsToExtraData(rows) {
  const result = {}
  rows.forEach(({ key, value }) => {
    if (key.trim()) result[key.trim()] = value
  })
  return result
}

export default function PersonForm({ initialPerson, onSubmit, onCancel, onDelete, submitting }) {
  const [firstName, setFirstName] = useState(initialPerson?.first_name ?? '')
  const [lastName, setLastName] = useState(initialPerson?.last_name ?? '')
  const [birthDate, setBirthDate] = useState(initialPerson?.birth_date ?? '')
  const [deathDate, setDeathDate] = useState(initialPerson?.death_date ?? '')
  const [bio, setBio] = useState(initialPerson?.bio ?? '')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(initialPerson?.photo ?? null)
  const [extraRows, setExtraRows] = useState(extraDataToRows(initialPerson?.extra_data))
  const [error, setError] = useState('')

  const isEdit = Boolean(initialPerson?.id)

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function updateRow(index, field, value) {
    setExtraRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addRow() {
    setExtraRows((rows) => [...rows, { key: '', value: '' }])
  }

  function removeRow(index) {
    setExtraRows((rows) => rows.filter((_, i) => i !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Имя и фамилия обязательны')
      return
    }
    if (birthDate && deathDate && deathDate < birthDate) {
      setError('Дата смерти не может быть раньше даты рождения')
      return
    }

    const data = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birth_date: birthDate || null,
      death_date: deathDate || null,
      bio,
      extra_data: rowsToExtraData(extraRows),
    }
    if (photoFile) {
      data.photo = photoFile
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="person-form">
      <label htmlFor="person-first-name">Имя</label>
      <input
        id="person-first-name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />

      <label htmlFor="person-last-name">Фамилия</label>
      <input id="person-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />

      <label htmlFor="person-birth-date">Дата рождения</label>
      <input
        id="person-birth-date"
        type="date"
        value={birthDate ?? ''}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      <label htmlFor="person-death-date">Дата смерти</label>
      <input
        id="person-death-date"
        type="date"
        value={deathDate ?? ''}
        onChange={(e) => setDeathDate(e.target.value)}
      />

      <label htmlFor="person-bio">Биография</label>
      <textarea id="person-bio" value={bio} onChange={(e) => setBio(e.target.value)} />

      <label htmlFor="person-photo">Фото</label>
      <input id="person-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
      {photoPreview && <img className="person-form-photo-preview" src={photoPreview} alt="Предпросмотр" />}

      <fieldset>
        <legend>Дополнительные поля</legend>
        {extraRows.map((row, index) => (
          <div className="person-form-extra-row" key={index}>
            <input
              placeholder="Название"
              value={row.key}
              onChange={(e) => updateRow(index, 'key', e.target.value)}
            />
            <input
              placeholder="Значение"
              value={row.value}
              onChange={(e) => updateRow(index, 'value', e.target.value)}
            />
            <button type="button" onClick={() => removeRow(index)} aria-label="Удалить поле">
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={addRow}>
          + добавить поле
        </button>
      </fieldset>

      {error && <p role="alert">{error}</p>}

      <div className="person-form-actions">
        <button type="submit" disabled={submitting}>
          {isEdit ? 'Сохранить' : 'Добавить'}
        </button>
        <button type="button" onClick={onCancel}>
          Отмена
        </button>
        {isEdit && onDelete && (
          <button type="button" className="danger" onClick={() => onDelete(initialPerson.id)}>
            Удалить
          </button>
        )}
      </div>
    </form>
  )
}
