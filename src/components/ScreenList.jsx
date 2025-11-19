import './ScreenList.css'

function ScreenList({ screens, onRemove }) {
  if (screens.length === 0) {
    return (
      <div className="empty-state">
        <p>📺 Aucun écran enregistré</p>
        <p className="hint">Scannez un écran pour commencer</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="screen-list">
      <h2 className="list-title">
        Écrans enregistrés ({screens.length})
      </h2>
      
      <div className="screens-container">
        {screens.map((screen) => (
          <div key={screen.id} className="screen-item">
            <div className="screen-info">
              <div className="screen-id">{screen.id}</div>
              <div className="screen-date">{formatDate(screen.date)}</div>
            </div>
            <button
              className="btn-delete"
              onClick={() => onRemove(screen.id)}
              aria-label={`Supprimer l'écran ${screen.id}`}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScreenList

