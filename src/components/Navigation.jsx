import './Navigation.css';

const Navigation = ({ currentPage, onNavigate }) => {
    const pages = [
        { id: 'scanner', label: 'Scanner', icon: '📷' },
        { id: 'inventories', label: 'Inventaires', icon: '📋' },
        { id: 'search', label: 'Recherche', icon: '🔍' },
        { id: 'settings', label: 'Paramètres', icon: '⚙️' }
    ];

    return (
        <nav className="app-navigation">
            {pages.map(page => (
                <button
                    key={page.id}
                    className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
                    onClick={() => onNavigate(page.id)}
                >
                    <span className="nav-icon">{page.icon}</span>
                    <span className="nav-label">{page.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default Navigation;
