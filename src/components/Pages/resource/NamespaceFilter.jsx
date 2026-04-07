export default function NamespaceFilter({ value, onChange }) {

    const namespaces = [
        "default",
        "kube-system",
        "kube-public"
    ];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border rounded p-2"
        >
            {namespaces.map(ns => (
                <option key={ns} value={ns}>
                    {ns}
                </option>
            ))}
        </select>
    );
}