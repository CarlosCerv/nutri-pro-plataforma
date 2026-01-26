import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const PremiumSelect = ({ options, value, onChange, name, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className={`premium-select-container ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
            <div
                className={`select-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="trigger-content">
                    {selectedOption ? (
                        <span className="selected-text">{selectedOption.label}</span>
                    ) : (
                        <span className="placeholder-text">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
                <div className="select-dropdown-popover animate-fade-in shadow-luxury">
                    <div className="options-list-scroll">
                        {options.map(option => (
                            <div
                                key={option.value}
                                className={`option-item ${value === option.value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className="option-name">{option.label}</span>
                                {value === option.value && <Check size={16} className="check-icon" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumSelect;
