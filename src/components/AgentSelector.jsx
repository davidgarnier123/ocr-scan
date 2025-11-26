import { getMockAgents } from '../utils/storage';
import './AgentSelector.css';

const AgentSelector = ({ selectedAgent, onSelect }) => {
    const agents = getMockAgents();

    return (
        <div className="agent-selector">
            <label htmlFor="agent-select" className="agent-label">
                Attribuer à un agent
            </label>
            <select
                id="agent-select"
                className="agent-select"
                value={selectedAgent?.id || ''}
                onChange={(e) => {
                    const agent = agents.find(a => a.id === e.target.value);
                    onSelect(agent);
                }}
            >
                <option value="">-- Sélectionner un agent --</option>
                {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                        {agent.name} - {agent.service}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AgentSelector;
