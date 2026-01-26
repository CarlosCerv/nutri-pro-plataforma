import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, User } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt._id === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        `${opt.firstName} ${opt.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange({ target: { name: 'patient', value: option._id } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`searchable-select-container ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
            <div
                className={`select-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="trigger-content">
                    {selectedOption ? (
                        <div className="selected-value-preview">
                            <div className="mini-avatar">
                                {selectedOption.firstName[0]}{selectedOption.lastName[0]}
                            </div>
                            <span className="selected-text">{selectedOption.firstName} {selectedOption.lastName}</span>
                        </div>
                    ) : (
                        <span className="placeholder-text">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
                <div className="select-dropdown-popover animate-fade-in">
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            className="search-input-field"
                            placeholder="Buscar paciente..."
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="options-list-scroll">
                        {filteredOptions.length === 0 ? (
                            <div className="no-results">No se encontraron pacientes</div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option._id}
                                    className={`option-item ${value === option._id ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    <div className="option-info">
                                        <div className="option-avatar">
                                            {option.firstName[0]}{option.lastName[0]}
                                        </div>
                                        <div className="option-text">
                                            <span className="option-name">{option.firstName} {option.lastName}</span>
                                            <span className="option-sub">{option.email}</span>
                                        </div>
                                    </div>
                                    {value === option._id && <Check size={16} className="check-icon" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
