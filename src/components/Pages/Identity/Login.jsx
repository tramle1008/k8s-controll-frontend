// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import TopNav from '../Admin/TopNav';
import LoginNavbar from './LoginNavbar';
// import { loginUser } from '../../../store/reducers/slices/authSlice'; // giả định bạn có slice auth

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(''); // clear error khi người dùng gõ
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Giả định bạn có action login trong redux
            // const result = await dispatch(loginUser(formData)).unwrap();

            // Thay bằng fetch thực tế của bạn
            const res = await fetch(`${import.meta.env.VITE_BACK_END_URL || 'http://localhost:8080'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Đăng nhập thất bại');
            }

            const data = await res.json();


            // Lưu vào localStorage
            // token chính
            localStorage.setItem("token", data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem("role", data.role);
            localStorage.setItem("clusterId", data.clusterId);
            console.log('Login success:', data);

            // Chuyển hướng sau khi login thành công
            if (data.role === "ADMIN") {
                navigate("/", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <LoginNavbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4 -mt-6">
                <div className="w-full max-w-md">
                    {/* Logo / Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-400 tracking-tight">K8s Dashboard</h1>
                        <p className="text-sm text-gray-400">Quản lý Kubernetes Cluster</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-2xl font-semibold text-black mb-6 text-center dark:text-white">Đăng nhập</h2>


                            <form onSubmit={handleSubmit} className="space-y-5">
                                <TextField
                                    fullWidth
                                    label="Tên đăng nhập"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    variant="outlined"
                                    autoComplete="username"
                                    autoFocus
                                    InputProps={{
                                        className: 'text-gray-200',
                                    }}
                                    InputLabelProps={{
                                        className: 'text-gray-400',
                                    }}
                                    sx={{
                                        mb: 3,          // margin-bottom: 24px (3 * 8px default spacing unit của MUI)
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'hsl(var(--border))',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'hsl(var(--primary))',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#60a5fa',
                                            },

                                        },
                                    }
                                    }
                                />

                                <TextField
                                    fullWidth
                                    label="Mật khẩu"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    variant="outlined"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    className="text-gray-400 hover:text-gray-200"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        className: 'text-gray-200',
                                    }}
                                    InputLabelProps={{
                                        className: 'text-gray-400',
                                    }}
                                    sx={{
                                        mb: 3,
                                        '& .MuiInputBase-input': {
                                            color: '#e5e7eb',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'hsl(var(--border))',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'hsl(var(--primary))',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#60a5fa',
                                            },
                                        },
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    className="mt-3 py-3 text-base font-medium"
                                    sx={{
                                        backgroundColor: '#3b82f6',
                                        '&:hover': {
                                            backgroundColor: '#2563eb',
                                        },
                                        textTransform: 'none',
                                    }}
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-400">
                                <a href="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
                                    Đăng Ký
                                </a>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-black/40 border-t border-[hsl(var(--border))] py-4 px-8 text-center text-xs text-gray-500">
                            © {new Date().getFullYear()} Kubernetes Dashboard • local-cluster
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}