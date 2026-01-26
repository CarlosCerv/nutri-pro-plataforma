import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dietTemplatesAPI } from '../services/api';
import { BookTemplate, Plus, Search, TrendingUp } from 'lucide-react';
import './DietTemplates.css';

const DietTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, [selectedCategory]);

    const fetchTemplates = async () => {
        try {
            const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
            const response = await dietTemplatesAPI.getAll(params);
            setTemplates(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await dietTemplatesAPI.getCategories();
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleUseTemplate = async (templateId) => {
        navigate(`/menu-builder?templateId=${templateId}`);
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner-large"></div>
            </div>
        );
    }

    return (
        <div className="diet-templates-page fade-in">
            <div className="page-header">
                <div>
                    <h1>Plantillas de Dietas</h1>
                    <p>Usa plantillas predefinidas para crear planes rápidamente</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/menu-builder')}>
                    <Plus size={20} />
                    Crear Plantilla
                </button>
            </div>

            <div className="templates-filters">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar plantillas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="category-filters">
                    <button
                        className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        Todas
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="templates-grid">
                {filteredTemplates.length === 0 ? (
                    <div className="empty-state-large">
                        <BookTemplate size={64} strokeWidth={1} />
                        <h3>No hay plantillas disponibles</h3>
                        <p>Crea tu primera plantilla personalizada</p>
                        <button className="btn btn-primary" onClick={() => navigate('/menu-builder')}>
                            <Plus size={20} />
                            Crear Plantilla
                        </button>
                    </div>
                ) : (
                    filteredTemplates.map((template) => (
                        <div key={template._id} className="template-card card">
                            <div className="template-header">
                                <div className="template-icon">
                                    {categories.find(c => c.value === template.category)?.icon || '📋'}
                                </div>
                                <div className="template-meta">
                                    <h3>{template.name}</h3>
                                    <span className="template-category">
                                        {categories.find(c => c.value === template.category)?.label || template.category}
                                    </span>
                                </div>
                            </div>

                            {template.description && (
                                <p className="template-description">{template.description}</p>
                            )}

                            <div className="template-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Calorías</span>
                                    <span className="stat-value">{template.targetCalories} kcal</span>
                                </div>
                                {template.usageCount > 0 && (
                                    <div className="stat-item">
                                        <TrendingUp size={14} />
                                        <span className="stat-value">{template.usageCount} usos</span>
                                    </div>
                                )}
                            </div>

                            {template.clinicalProfile?.suitableFor && template.clinicalProfile.suitableFor.length > 0 && (
                                <div className="template-tags">
                                    {template.clinicalProfile.suitableFor.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="badge badge-success">{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div className="template-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleUseTemplate(template._id)}
                                >
                                    Usar Plantilla
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DietTemplates;
