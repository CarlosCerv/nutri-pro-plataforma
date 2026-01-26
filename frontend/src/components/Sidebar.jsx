
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, UtensilsCrossed, Calculator, Leaf, BookTemplate, DollarSign } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ mobileOpen, onClose }) => {
    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/patients', icon: Users, label: 'Pacientes' },
        { path: '/appointments', icon: Calendar, label: 'Citas' },
        { path: '/mealplans', icon: UtensilsCrossed, label: 'Planes' },
        { path: '/diet-templates', icon: BookTemplate, label: 'Plantillas' },
        { path: '/calculator', icon: Calculator, label: 'Calculadora' },
        { path: '/finance', icon: DollarSign, label: 'Finanzas' },
    ];

    const handleLinkClick = () => {
        // Close mobile menu when a link is clicked
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {mobileOpen && <div className="sidebar-overlay active" onClick={onClose}></div>}
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <Link to="/dashboard" className="sidebar-logo-link">
                    <div className="sidebar-logo">
                        <div className="logo-container">
                            <Leaf size={24} strokeWidth={2.5} color="white" />
                        </div>
                        <span className="logo-text">NutriPro</span>
                    </div>
                </Link>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={handleLinkClick}
                        >
                            <item.icon size={22} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
