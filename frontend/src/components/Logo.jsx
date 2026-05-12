import { Salad } from 'lucide-react';

const Logo = ({ size = 40, showText = true, color = 'var(--text-primary)' }) => {
    return (
        <div className="flex items-center justify-center" style={{ gap: '0.75rem' }}>
            <div
                style={{
                    width: size * 1.35,
                    height: size * 1.35,
                    background: '#EAF8EF',
                    border: '1px solid rgba(52, 199, 89, 0.22)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Salad size={size * 0.72} color="#248A3D" strokeWidth={1.8} />
            </div>
            {showText && (
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: size * 0.62, margin: 0, lineHeight: 1, color }}>NutriPro</h2>
                    <p style={{ fontSize: size * 0.28, margin: '4px 0 0', color: 'var(--text-secondary)' }}>PLATFORM</p>
                </div>
            )}
        </div>
    );
};

export default Logo;
