import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

const BackButton = ({ to, label = 'Volver', className = '' }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            className={`back-button ${className}`}
            onClick={handleClick}
            aria-label={label}
        >
            <ArrowLeft size={20} />
            <span>{label}</span>
        </button>
    );
};

export default BackButton;
