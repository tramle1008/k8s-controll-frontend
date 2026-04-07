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

export default function RegisterDialog({ open, onOpenChange }) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "USER",
        clusterId: ""
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

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACK_END_URL || "http://localhost:8080"}/api/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.errorMessage || "Đăng ký thất bại");
            }

            onOpenChange(false); // đóng dialog thành công
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
                    <DialogTitle>Gán User cho Cluster</DialogTitle>
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

                    {/* CLUSTER ID */}
                    <div>
                        <Label>Cluster ID</Label>
                        <Input
                            name="clusterId"
                            placeholder="cluster id"
                            value={formData.clusterId}
                            onChange={handleChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="outline"
                            disabled={loading}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}