import { useState } from 'react';

export default function CreateNS() {
    const [namespaceName, setNamespaceName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!namespaceName.trim()) {
            setError('Vui lòng nhập tên namespace');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch('/api/namespaces', {  // thay bằng URL thật của bạn
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu backend yêu cầu auth: 'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: namespaceName.trim(),
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Lỗi ${response.status}`);
            }

            const created = await response.json();
            setMessage(`Tạo namespace thành công: ${created.metadata.name}`);
            setNamespaceName(''); // reset form
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tạo namespace');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Tạo Namespace mới</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.2rem' }}>
                    <label htmlFor="ns-name" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Tên Namespace
                    </label>
                    <input
                        id="ns-name"
                        type="text"
                        value={namespaceName}
                        onChange={(e) => setNamespaceName(e.target.value)}
                        placeholder="Ví dụ: dev-team-a, production, staging"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                        }}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: '0.3rem' }}>
                        Chỉ chứa chữ thường, số, dấu gạch ngang (-), không bắt đầu hoặc kết thúc bằng dấu gạch ngang.
                    </small>
                </div>

                <button
                    type="submit"
                    disabled={loading || !namespaceName.trim()}
                    style={{
                        padding: '0.7rem 1.5rem',
                        backgroundColor: loading ? '#aaa' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                    }}
                >
                    {loading ? 'Đang tạo...' : 'Tạo Namespace'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    Lỗi: {error}
                </div>
            )}
        </div>
    );
}