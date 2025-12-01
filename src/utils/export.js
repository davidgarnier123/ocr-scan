/**
 * Export utilities for inventory data
 */

/**
 * Export inventories as JSON
 */
export const exportToJSON = (inventories) => {
    const dataStr = JSON.stringify(inventories, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, `inventaires_${getTimestamp()}.json`);
};

/**
 * Export inventories as CSV
 */
export const exportToCSV = (inventories, equipmentDatabase) => {
    const headers = [
        'Date',
        'Agent',
        'Service',
        'Code Équipement',
        'Type',
        'Marque',
        'Modèle',
        'N° Série',
        'Notes'
    ];

    const rows = [];

    inventories.forEach(inventory => {
        const date = new Date(inventory.timestamp).toLocaleDateString('fr-FR');
        const agent = inventory.agent?.name || 'N/A';
        const service = inventory.agent?.service || 'N/A';
        const notes = inventory.notes || '';

        inventory.devices.forEach(deviceCode => {
            const equipment = equipmentDatabase?.[deviceCode];
            rows.push([
                date,
                agent,
                service,
                deviceCode,
                equipment?.equipment_type || 'N/A',
                equipment?.brand || 'N/A',
                equipment?.model || 'N/A',
                equipment?.serial_number || 'N/A',
                notes
            ]);
        });
    });

    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `inventaires_${getTimestamp()}.csv`);
};

/**
 * Export inventories as styled HTML
 */
export const exportToHTML = (inventories, equipmentDatabase) => {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventaires - Export ${new Date().toLocaleDateString('fr-FR')}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            color: #2d3748;
            font-size: 32px;
            margin-bottom: 10px;
        }

        .header .meta {
            color: #718096;
            font-size: 14px;
        }

        .inventory-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            page-break-inside: avoid;
        }

        .inventory-header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .inventory-title {
            font-size: 20px;
            color: #2d3748;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .inventory-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 14px;
            color: #718096;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .meta-label {
            font-weight: 600;
            color: #4a5568;
        }

        .equipment-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .equipment-item {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            transition: all 0.2s;
        }

        .equipment-item:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .equipment-code {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 8px;
        }

        .equipment-type {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .equipment-details {
            font-size: 13px;
            color: #4a5568;
        }

        .equipment-details div {
            margin-bottom: 4px;
        }

        .equipment-label {
            font-weight: 600;
            color: #2d3748;
            display: inline-block;
            min-width: 80px;
        }

        .notes-section {
            margin-top: 20px;
            padding: 15px;
            background: #fff5e6;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
        }

        .notes-label {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }

        .notes-content {
            color: #78350f;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .inventory-card {
                box-shadow: none;
                border: 1px solid #e2e8f0;
            }
        }

        @media (max-width: 768px) {
            .equipment-grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Inventaires Parc Informatique</h1>
            <div class="meta">
                Export généré le ${new Date().toLocaleString('fr-FR')} • ${inventories.length} inventaire(s) • ${getTotalDevices(inventories)} équipement(s)
            </div>
        </div>

        ${inventories.map((inventory, index) => generateInventoryCard(inventory, index, equipmentDatabase)).join('')}
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    downloadFile(blob, `inventaires_${getTimestamp()}.html`);
};

/**
 * Generate HTML card for a single inventory
 */
function generateInventoryCard(inventory, index, equipmentDatabase) {
    const date = new Date(inventory.timestamp).toLocaleString('fr-FR');
    const agent = inventory.agent?.name || 'Agent non spécifié';
    const service = inventory.agent?.service || 'Service non spécifié';
    const deviceCount = inventory.devices.length;

    return `
        <div class="inventory-card">
            <div class="inventory-header">
                <div class="inventory-title">Inventaire #${index + 1}</div>
                <div class="inventory-meta">
                    <div class="meta-item">
                        <span class="meta-label">📅 Date:</span>
                        <span>${date}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">👤 Agent:</span>
                        <span>${agent}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">🏢 Service:</span>
                        <span>${service}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">📦 Équipements:</span>
                        <span>${deviceCount}</span>
                    </div>
                </div>
            </div>

            <div class="equipment-grid">
                ${inventory.devices.map(deviceCode => generateEquipmentItem(deviceCode, equipmentDatabase)).join('')}
            </div>

            ${inventory.notes ? `
                <div class="notes-section">
                    <div class="notes-label">📝 Notes</div>
                    <div class="notes-content">${escapeHtml(inventory.notes)}</div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Generate HTML for a single equipment item
 */
function generateEquipmentItem(deviceCode, equipmentDatabase) {
    const equipment = equipmentDatabase?.[deviceCode];

    if (!equipment) {
        return `
            <div class="equipment-item">
                <div class="equipment-code">${deviceCode}</div>
                <div class="equipment-type">Non répertorié</div>
                <div class="equipment-details">
                    <div>Équipement non trouvé dans la base de données</div>
                </div>
            </div>
        `;
    }

    return `
        <div class="equipment-item">
            <div class="equipment-code">${deviceCode}</div>
            <div class="equipment-type">${equipment.equipment_type || 'N/A'}</div>
            <div class="equipment-details">
                <div><span class="equipment-label">Marque:</span> ${equipment.brand || 'N/A'}</div>
                <div><span class="equipment-label">Modèle:</span> ${equipment.model || 'N/A'}</div>
                ${equipment.serial_number ? `<div><span class="equipment-label">N° Série:</span> ${equipment.serial_number}</div>` : ''}
                ${equipment.agent_name ? `<div><span class="equipment-label">Assigné à:</span> ${equipment.agent_name}</div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Helper functions
 */
function downloadFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function getTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

function getTotalDevices(inventories) {
    return inventories.reduce((total, inv) => total + inv.devices.length, 0);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
