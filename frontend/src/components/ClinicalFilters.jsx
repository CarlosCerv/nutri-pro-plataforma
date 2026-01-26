import { useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import './ClinicalFilters.css';

const ClinicalFilters = ({ filters, onChange, onClose }) => {
    const [localFilters, setLocalFilters] = useState(filters || {
        excludedAllergens: [],
        pathologyAdaptations: [],
        maxSodium: null,
        maxGlycemicIndex: null,
    });

    const allergenOptions = [
        { value: 'gluten', label: 'Gluten' },
        { value: 'lactose', label: 'Lactosa' },
        { value: 'nuts', label: 'Frutos Secos' },
        { value: 'soy', label: 'Soya' },
        { value: 'eggs', label: 'Huevo' },
        { value: 'fish', label: 'Pescado' },
        { value: 'shellfish', label: 'Mariscos' },
        { value: 'peanuts', label: 'Cacahuates' },
    ];

    const pathologyOptions = [
        { value: 'diabetic', label: 'Diabético' },
        { value: 'hypertensive', label: 'Hipertenso' },
        { value: 'celiac', label: 'Celíaco' },
        { value: 'lactose-intolerant', label: 'Intolerante a Lactosa' },
        { value: 'low-sodium', label: 'Bajo Sodio' },
        { value: 'low-fat', label: 'Bajo en Grasas' },
        { value: 'low-glycemic', label: 'Bajo Índice Glucémico' },
        { value: 'renal', label: 'Renal' },
        { value: 'cardiac', label: 'Cardíaco' },
    ];

    const handleAllergenToggle = (allergen) => {
        const newAllergens = localFilters.excludedAllergens.includes(allergen)
            ? localFilters.excludedAllergens.filter(a => a !== allergen)
            : [...localFilters.excludedAllergens, allergen];

        const newFilters = { ...localFilters, excludedAllergens: newAllergens };
        setLocalFilters(newFilters);
        onChange(newFilters);
    };

    const handlePathologyToggle = (pathology) => {
        const newPathologies = localFilters.pathologyAdaptations.includes(pathology)
            ? localFilters.pathologyAdaptations.filter(p => p !== pathology)
            : [...localFilters.pathologyAdaptations, pathology];

        const newFilters = { ...localFilters, pathologyAdaptations: newPathologies };
        setLocalFilters(newFilters);
        onChange(newFilters);
    };

    const handleSodiumChange = (e) => {
        const value = e.target.value ? parseInt(e.target.value) : null;
        const newFilters = { ...localFilters, maxSodium: value };
        setLocalFilters(newFilters);
        onChange(newFilters);
    };

    const handleGIChange = (e) => {
        const value = e.target.value ? parseInt(e.target.value) : null;
        const newFilters = { ...localFilters, maxGlycemicIndex: value };
        setLocalFilters(newFilters);
        onChange(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            excludedAllergens: [],
            pathologyAdaptations: [],
            maxSodium: null,
            maxGlycemicIndex: null,
        };
        setLocalFilters(emptyFilters);
        onChange(emptyFilters);
    };

    return (
        <div className="clinical-filters">
            <div className="filters-header">
                <h3>Filtros Clínicos</h3>
                {onClose && (
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="filters-section">
                <h4>Excluir Alérgenos</h4>
                <div className="filter-options">
                    {allergenOptions.map(option => (
                        <label key={option.value} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={localFilters.excludedAllergens.includes(option.value)}
                                onChange={() => handleAllergenToggle(option.value)}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="filters-section">
                <h4>Adaptaciones por Patología</h4>
                <div className="filter-options">
                    {pathologyOptions.map(option => (
                        <label key={option.value} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={localFilters.pathologyAdaptations.includes(option.value)}
                                onChange={() => handlePathologyToggle(option.value)}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="filters-section">
                <h4>Límites Nutricionales</h4>
                <div className="filter-range">
                    <label>
                        Sodio Máximo (mg/día)
                        <input
                            type="number"
                            value={localFilters.maxSodium || ''}
                            onChange={handleSodiumChange}
                            placeholder="Ej: 2000"
                            min="0"
                            max="5000"
                            step="100"
                        />
                    </label>
                </div>
                <div className="filter-range">
                    <label>
                        Índice Glucémico Máximo
                        <input
                            type="number"
                            value={localFilters.maxGlycemicIndex || ''}
                            onChange={handleGIChange}
                            placeholder="Ej: 55"
                            min="0"
                            max="100"
                            step="5"
                        />
                    </label>
                </div>
            </div>

            <div className="filters-footer">
                <button className="btn btn-outline" onClick={clearFilters}>
                    Limpiar Filtros
                </button>
            </div>
        </div>
    );
};

ClinicalFilters.propTypes = {
    filters: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
};

export default ClinicalFilters;
