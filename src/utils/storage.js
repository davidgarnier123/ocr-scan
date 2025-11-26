// Utilitaires de gestion du localStorage pour l'application d'inventaire

const STORAGE_KEYS = {
  INVENTORIES: 'inventory_data',
  CURRENT_SESSION: 'current_scan_session',
  EQUIPMENT_DATABASE: 'equipmentDatabase',
  DATABASE_META: 'databaseMeta'
};

// Agents mockés pour le développement initial
const MOCK_AGENTS = [
  { id: '1', name: 'Jean Dupont', service: 'IT Support' },
  { id: '2', name: 'Marie Martin', service: 'Comptabilité' },
  { id: '3', name: 'Pierre Durand', service: 'Direction' },
  { id: '4', name: 'Sophie Lefebvre', service: 'RH' },
  { id: '5', name: 'Luc Bernard', service: 'Commercial' },
  { id: '6', name: 'Claire Dubois', service: 'Marketing' },
  { id: '7', name: 'Antoine Rousseau', service: 'IT Support' },
  { id: '8', name: 'Isabelle Moreau', service: 'Logistique' }
];

/**
 * Récupère tous les inventaires stockés
 * @returns {Array} Liste des inventaires
 */
export function getInventories() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des inventaires:', error);
    return [];
  }
}

/**
 * Sauvegarde un nouvel inventaire
 * @param {Object} inventory - L'inventaire à sauvegarder
 * @returns {boolean} Succès de l'opération
 */
export function saveInventory(inventory) {
  try {
    const inventories = getInventories();
    const newInventory = {
      id: `inv_${Date.now()}`,
      ...inventory,
      createdAt: new Date().toISOString()
    };
    inventories.unshift(newInventory); // Ajoute au début
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(inventories));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'inventaire:', error);
    return false;
  }
}

/**
 * Supprime un inventaire par son ID
 * @param {string} id - ID de l'inventaire à supprimer
 * @returns {boolean} Succès de l'opération
 */
export function deleteInventory(id) {
  try {
    const inventories = getInventories();
    const filtered = inventories.filter(inv => inv.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inventaire:', error);
    return false;
  }
}

/**
 * Récupère la session de scan en cours
 * @returns {Array} Liste des codes scannés dans la session actuelle
 */
export function getCurrentSession() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return [];
  }
}

/**
 * Sauvegarde la session de scan en cours
 * @param {Array} codes - Liste des codes scannés
 */
export function saveCurrentSession(codes) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(codes));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la session:', error);
  }
}

/**
 * Efface la session de scan en cours
 */
export function clearCurrentSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Erreur lors de l\'effacement de la session:', error);
  }
}

/**
 * Réinitialise toutes les données de l'application
 * @returns {boolean} Succès de l'opération
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.INVENTORIES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_DATABASE);
    localStorage.removeItem(STORAGE_KEYS.DATABASE_META);
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des données:', error);
    return false;
  }
}

/**
 * Récupère la liste des agents (actuellement mockés)
 * @returns {Array} Liste des agents
 */
export function getMockAgents() {
  return MOCK_AGENTS;
}

/**
 * Récupère un agent par son ID
 * @param {string} id - ID de l'agent
 * @returns {Object|null} Agent trouvé ou null
 */
export function getAgentById(id) {
  return MOCK_AGENTS.find(agent => agent.id === id) || null;
}

/**
 * Récupère la base de données des équipements
 * @returns {Array} Liste des équipements
 */
export function getEquipmentDatabase() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_DATABASE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la base d\'équipements:', error);
    return [];
  }
}

/**
 * Sauvegarde la base de données des équipements
 * @param {Array} equipments - Liste des équipements
 * @returns {boolean} Succès de l'opération
 */
export function saveEquipmentDatabase(equipments) {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_DATABASE, JSON.stringify(equipments));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la base d\'équipements:', error);
    return false;
  }
}

/**
 * Récupère les métadonnées de la base de données
 * @returns {Object|null} Métadonnées ou null
 */
export function getDatabaseMeta() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DATABASE_META);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    return null;
  }
}

/**
 * Sauvegarde les métadonnées de la base de données
 * @param {Object} meta - Métadonnées (uploadDate, totalItems, fileName)
 * @returns {boolean} Succès de l'opération
 */
export function saveDatabaseMeta(meta) {
  try {
    localStorage.setItem(STORAGE_KEYS.DATABASE_META, JSON.stringify(meta));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des métadonnées:', error);
    return false;
  }
}

/**
 * Récupère un équipement par son code-barres (barcode_id)
 * @param {string} barcodeId - ID du code-barres
 * @returns {Object|null} Équipement trouvé ou null
 */
export function getEquipmentById(barcodeId) {
  const database = getEquipmentDatabase();
  return database.find(item => item.barcode_id === barcodeId) || null;
}

/**
 * Extrait les agents uniques de la base de données des équipements
 * Si la base est vide, retourne les agents mockés
 * @returns {Array} Liste des agents avec {name, service}
 */
export function extractAgentsFromDatabase() {
  const database = getEquipmentDatabase();

  // Fallback vers agents mockés si pas de base
  if (database.length === 0) {
    return getMockAgents();
  }

  const uniqueAgents = new Map();

  database.forEach(item => {
    if (item.agent_name && item.agent_name !== '""' && item.agent_name.trim() !== '') {
      // Utiliser le nom comme clé pour garantir l'unicité
      if (!uniqueAgents.has(item.agent_name)) {
        uniqueAgents.set(item.agent_name, {
          name: item.agent_name,
          service: item.org_path || 'Service inconnu'
        });
      }
    }
  });

  const agents = Array.from(uniqueAgents.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Si aucun agent trouvé dans la base, retourner les mockés
  return agents.length > 0 ? agents : getMockAgents();
}

/**
 * Efface la base de données des équipements et ses métadonnées
 * @returns {boolean} Succès de l'opération
 */
export function clearEquipmentDatabase() {
  try {
    localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_DATABASE);
    localStorage.removeItem(STORAGE_KEYS.DATABASE_META);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'effacement de la base d\'équipements:', error);
    return false;
  }
}
