import { useState, useMemo, useEffect, useRef } from 'react';
import { extractAgentsFromDatabase } from '../utils/storage';
import './AgentSelector.css';

const AgentSelector = ({ selectedAgent, onSelect }) => {
    const [agentSearch, setAgentSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [agents, setAgents] = useState([]);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Load agents on mount
    useEffect(() => {
        setAgents(extractAgentsFromDatabase());
    }, []);

    // Update search field when selectedAgent changes
    useEffect(() => {
        if (selectedAgent) {
            setAgentSearch(selectedAgent.name);
        } else {
            setAgentSearch('');
        }
    }, [selectedAgent]);

    // Filter suggestions based on search input
    const filteredAgents = useMemo(() => {
        if (!agentSearch) return [];
        const searchLower = agentSearch.toLowerCase();
        return agents.filter(agent =>
            agent.name.toLowerCase().includes(searchLower)
        ).slice(0, 5); // Limiter à 5 suggestions
    }, [agentSearch, agents]);

    // Handle agent selection
    const handleAgentSelect = (agent) => {
        onSelect(agent);
        setAgentSearch(agent.name);
        setShowSuggestions(false);
    };

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setAgentSearch(value);
        setShowSuggestions(true);

        // Create a custom agent object with the typed name
        if (value.trim()) {
            const customAgent = {
                name: value.trim(),
                service: 'Non répertorié'
            };
            onSelect(customAgent);
        } else {
            onSelect(null);
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="agent-selector" ref={wrapperRef}>
            <label htmlFor="agent-search" className="agent-label">
                Attribuer à un agent
            </label>
            <div className="autocomplete-wrapper">
                <input
                    ref={inputRef}
                    id="agent-search"
                    type="text"
                    value={agentSearch}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Rechercher nom ou prénom..."
                    className="agent-search-input"
                    autoComplete="off"
                />
                {showSuggestions && agentSearch && filteredAgents.length > 0 && (
                    <ul className="autocomplete-suggestions">
                        {filteredAgents.map((agent, index) => (
                            <li
                                key={index}
                                onClick={() => handleAgentSelect(agent)}
                                className="suggestion-item"
                            >
                                <span className="suggestion-name">{agent.name}</span>
                                <span className="suggestion-service">{agent.service}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {showSuggestions && agentSearch && filteredAgents.length === 0 && (
                    <div className="no-suggestions">
                        Aucun agent trouvé
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentSelector;

