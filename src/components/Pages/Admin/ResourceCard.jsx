import { useNavigate } from 'react-router-dom';

export default function ResourceCard({
    title,
    value,
    subValue,
    icon,
    trend,
    warning,
    statusType,
    linkTo = null  // prop mới: route để navigate khi click
}) {
    const navigate = useNavigate();

    const isClickable = !!linkTo;  // Nếu có linkTo thì clickable

    const handleClick = () => {
        if (isClickable) {
            navigate(linkTo);
        }
    };

    let statusColor = '';
    if (statusType === 'running') statusColor = 'text-green-400';
    if (statusType === 'pending') statusColor = 'text-yellow-400';
    if (statusType === 'failed') statusColor = 'text-red-400';

    const trendColor = trend?.startsWith('+') ? 'text-green-400' : 'text-red-400';

    return (
        <div
            onClick={handleClick}
            className={`
                bg-[hsl(var(--card))] p-5 rounded-lg border border-[hsl(var(--border))] shadow-sm
                transition-all duration-200
                ${isClickable
                    ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-blue-500/50'
                    : 'cursor-default'}
            `}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className={`text-2xl font-semibold mt-1`}>{value}</p>

                    <div className="text-xs mt-1">
                        {subValue}
                    </div>
                </div>
                <i className={`fas fa-${icon} text-3xl text-blue-500 opacity-80`}></i>
            </div>

            {trend && (
                <p className={`text-xs mt-3 ${trendColor}`}>
                    {trend} <span className="text-gray-500">last 24h</span>
                </p>
            )}

            {warning && (
                <p className="text-xs text-yellow-400 mt-2">● Warning</p>
            )}

            {/* Hint khi hover cho card clickable */}
            {isClickable && (
                <p className="text-xs text-blue-400/70 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click để xem chi tiết {title} →
                </p>
            )}
        </div>
    );
}