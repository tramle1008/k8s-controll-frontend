export default function StatusBadge({ status }) {

    const color = {
        Running: "bg-green-500",
        Pending: "bg-yellow-500",
        Failed: "bg-red-500"
    };

    return (
        <span className={`px-2 py-1 text-white text-xs rounded ${color[status] || "bg-gray-500"}`}>
            {status}
        </span>
    );
}