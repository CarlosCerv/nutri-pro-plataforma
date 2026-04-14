import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    const handleLogout = () => {
        logout();
    };


    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="btn-menu mobile-only" onClick={() => onMenuToggle(true)}>
                    <Menu size={24} />
                </button>
                <div className="navbar-brand">
                    <h2>NutriPro</h2>
                </div>
            </div>

            <div className="navbar-content-right">
                <div className="user-display">
                    <div className="user-avatar">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="user-text-info">
                        <span className="user-name">{user?.name || 'Usuario'}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                </div>

                <div className="navbar-divider"></div>

                <div className="navbar-actions">
                    <Link to="/profile" className="btn-icon" title="Mi Cuenta">
                        <User size={20} />
                    </Link>
                    <button onClick={handleLogout} className="btn-icon btn-logout-icon" title="Cerrar Sesión">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
