function yearOf(dateString) {
  return dateString ? dateString.slice(0, 4) : '?'
}

export default function PersonCard({ person, onEdit, onDelete }) {
  const years = person.birth_date || person.death_date ? `${yearOf(person.birth_date)} – ${yearOf(person.death_date)}` : null

  return (
    <div className="person-card">
      {person.photo ? (
        <img className="person-card-photo" src={person.photo} alt={`${person.first_name} ${person.last_name}`} />
      ) : (
        <div className="person-card-photo person-card-photo-fallback" aria-hidden="true">
          {person.first_name?.[0]}
          {person.last_name?.[0]}
        </div>
      )}

      <h3>
        {person.first_name} {person.last_name}
      </h3>
      {years && <p className="person-card-years">{years}</p>}
      {person.bio && <p className="person-card-bio">{person.bio.slice(0, 140)}</p>}

      <div className="person-card-actions">
        {onEdit && (
          <button type="button" onClick={() => onEdit(person)}>
            Редактировать
          </button>
        )}
        {onDelete && (
          <button type="button" className="danger" onClick={() => onDelete(person.id)}>
            Удалить
          </button>
        )}
      </div>
    </div>
  )
}
