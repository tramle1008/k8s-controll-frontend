export default function ClusterCapacityCard({ metrics = {}, loading }) {

    // 🔥 Đảm bảo metrics luôn có cấu trúc an toàn
    const {
        cpuPercent = 0,
        cpuUsedCores = 0,
        cpuTotalCores = 0,
        memoryPercent = 0,
        memoryUsedGi = 0,
        memoryTotalGi = 0,
        podsUsed = 0,
        podsTotal = 0
    } = metrics || {};

    // 🔥 Tính % pods an toàn
    const podsPercent = podsTotal ? (podsUsed / podsTotal) * 100 : 0;

    const Bar = ({ label, percent, text, color = "bg-green-500" }) => (
        <div className="flex items-center gap-3">
            <div className="w-12 text-sm text-gray-400 font-medium">{label}</div>

            <div className="flex-1">
                <div className="w-full bg-gray-700 rounded h-2">
                    <div
                        className={`${color} h-2 rounded`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>

            <div className="text-sm text-gray-400 w-10 text-right">
                {percent.toFixed(0)}%
            </div>

            <div className="text-sm text-gray-700 w-28 text-right">
                {text}
            </div>
        </div>
    );

    if (loading) {
        return <div className="p-5">Loading metrics...</div>;
    }

    const getColor = (percent) => {
        if (percent > 80) return "bg-red-500";
        if (percent > 50) return "bg-yellow-400";
        return "bg-green-400";
    };

    return (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-5 h-full">
            <h2 className="text-lg font-semibold mb-4">Cluster Capacity</h2>

            <div className="space-y-3">
                <Bar
                    label="CPU"
                    percent={cpuPercent}
                    color={getColor(cpuPercent)}
                    text={`${cpuUsedCores} / ${cpuTotalCores} cores`}
                />

                <Bar
                    label="MEM"
                    percent={memoryPercent}
                    color={getColor(memoryPercent)}
                    text={`${memoryUsedGi} / ${memoryTotalGi} Gi`}
                />

                <Bar
                    label="PODS"
                    percent={podsPercent}
                    color={getColor(podsPercent)}
                    text={`${podsUsed} / ${podsTotal}`}
                />
            </div>
        </div>
    );
}