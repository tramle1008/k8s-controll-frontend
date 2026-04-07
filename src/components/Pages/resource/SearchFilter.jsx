export default function SearchFilter({ value, onChange }) {

    return (
        <input
            placeholder="Filter..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border rounded p-2 w-64"
        />
    );
}