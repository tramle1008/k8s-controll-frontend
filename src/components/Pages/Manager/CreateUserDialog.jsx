import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

export default function CreateUserDialog({ open, onOpenChange, defaultClusterId, onSuccess }) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "USER",
        clusterId: defaultClusterId || ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (formData.role === "USER" && !formData.clusterId) {
            setError("Cluster ID bắt buộc đối với role USER");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // chuẩn bị payload gửi backend
            const payload = formData.role === "USER"
                ? { username: formData.username, password: formData.password, role: "USER", clusterId: Number(formData.clusterId) }
                : { username: formData.username, password: formData.password, role: "ADMIN" };

            const res = await fetch(
                `${import.meta.env.VITE_BACK_END_URL || "http://localhost:8080"}/api/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.errorMessage || "Tạo user thất bại");
            }

            onOpenChange(false); // đóng dialog nếu thành công
            setFormData({ username: "", password: "", role: "USER", clusterId: defaultClusterId || "" });

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Tạo người dùng mới</DialogTitle>
                    <DialogDescription className="sr-only">-</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    {/* USERNAME */}
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <Input
                            name="username"
                            placeholder="username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <Label>Mật khẩu</Label>
                        <div className="relative">
                            <Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* ROLE */}
                    <div>
                        <Label>Role</Label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border rounded-md px-2 py-1"
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* CLUSTER ID (chỉ khi USER) */}
                    {formData.role === "USER" && (
                        <div>
                            <Label>Cluster ID</Label>
                            <Input
                                name="clusterId"
                                type="number"
                                placeholder="cluster id"
                                value={formData.clusterId}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>

                        <Button
                            type="submit"
                            variant="outline"
                            disabled={loading}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            {loading ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}