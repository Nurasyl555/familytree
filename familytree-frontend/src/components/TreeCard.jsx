import { Link } from 'react-router-dom'

const PRIVACY_LABELS = {
  private: 'Закрытое',
  link: 'По ссылке',
  public: 'Открытое',
}

export default function TreeCard({ tree, onDelete }) {
  return (
    <div className="tree-card">
      <Link to={`/trees/${tree.id}`}>
        <h3>{tree.name}</h3>
      </Link>
      <span className="tree-card-privacy">{PRIVACY_LABELS[tree.privacy] ?? tree.privacy}</span>
      {onDelete && (
        <button type="button" onClick={() => onDelete(tree.id)}>
          Удалить
        </button>
      )}
    </div>
  )
}
