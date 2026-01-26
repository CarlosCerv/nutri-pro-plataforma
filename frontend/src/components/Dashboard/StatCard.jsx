import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ label, value, trend, trendValue, icon: Icon, colorClass }) => {
    const isPositive = trend === 'positive';
    const isNegative = trend === 'negative';

    return (
        <div className="stat-card-modern">
            <div className={`stat-icon-wrapper ${colorClass}`}>
                <Icon size={22} />
            </div>
            <div className="stat-info">
                <p className="stat-label">{label}</p>
                <div className="stat-number-row">
                    <h3>{value}</h3>
                    {trendValue && (
                        <span className={`trend-badge ${trend || 'neutral'}`}>
                            {isPositive && <ArrowUpRight size={14} />}
                            {isNegative && <ArrowDownRight size={14} />}
                            {trendValue}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
