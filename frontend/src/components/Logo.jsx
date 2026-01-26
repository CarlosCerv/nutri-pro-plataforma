import { Heart } from 'lucide-react';

const Logo = ({ size = 40, showText = true, color = 'white' }) => {
    return (
        <div className="flex items-center gap-sm justify-center">
            <div
                style={{
                    width: size * 1.5,
                    height: size * 1.5,
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
                }}
            >
                <Heart size={size} color="white" fill="white" strokeWidth={1.5} />
            </div>
            {showText && (
                <div style={{ textAlign: 'left', marginLeft: '12px' }}>
                    <h2 style={{ fontSize: size * 0.8, margin: 0, lineHeight: 1, color: color === 'white' ? 'white' : 'var(--text-primary)' }}>NutriPlan</h2>
                    <p style={{ fontSize: size * 0.35, margin: 0, opacity: 0.8, color: color === 'white' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>PLATFORM</p>
                </div>
            )}
        </div>
    );
};

export default Logo;
