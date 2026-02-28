const deployments = [
    { name: 'frontend', namespace: 'production', replicas: '3/3', age: '12d', images: 'nginx:1.25' },
    { name: 'api', namespace: 'production', replicas: '2/2', age: '8d', images: 'node:20-alpine' },
    { name: 'cache', namespace: 'dev', replicas: '1/1', age: '3h', images: 'redis:7' },
];

export default function ResourceTable() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-500">
                    <tr>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Namespace</th>
                        <th className="px-6 py-3 font-medium">Replicas</th>
                        <th className="px-6 py-3 font-medium">Age</th>
                        <th className="px-6 py-3 font-medium">Image</th>
                        <th className="px-6 py-3 font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {deployments.map((dep) => (
                        <tr key={dep.name} className="border-t border-gray-800 hover:bg-gray-600/50">
                            <td className="px-6 py-4 font-medium text-blue-300">{dep.name}</td>
                            <td className="px-6 py-4 text-gray-400">{dep.namespace}</td>
                            <td className="px-6 py-4">{dep.replicas}</td>
                            <td className="px-6 py-4 text-gray-400">{dep.age}</td>
                            <td className="px-6 py-4 font-mono text-gray-300">{dep.images}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-white">
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}