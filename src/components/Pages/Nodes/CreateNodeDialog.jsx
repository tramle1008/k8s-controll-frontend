import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { coreApi } from "../../../api/api";

export default function CreateNodeDialog({ open, onOpenChange }) {

    const [sshStatus, setSshStatus] = useState("idle");
    const [sshMessage, setSshMessage] = useState("");
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({
        nodes: [
            {
                name: "",
                role: "worker",
                ip: "",
                user: "",
                ssh: {
                    method: "password",
                    password: "",
                    publicKey: ""
                }
            }
        ]
    });

    const { selectedClusterId, clusters } = useSelector((state) => state.cluster);
    const currentCluster = clusters.find(c => c.id === selectedClusterId);

    useEffect(() => {
        if (currentCluster) {
            setForm(prev => ({
                ...prev,
                clusterName: currentCluster.name
            }));
        }
    }, [currentCluster]);

    /* update node */
    const updateNode = (field, value) => {
        setForm(prev => ({
            ...prev,
            nodes: [
                {
                    ...prev.nodes[0],
                    [field]: value
                }
            ]
        }));
    };

    /* update ssh */
    const updateSSH = (field, value) => {
        setForm(prev => ({
            ...prev,
            nodes: [
                {
                    ...prev.nodes[0],
                    ssh: {
                        ...prev.nodes[0].ssh,
                        [field]: value
                    }
                }
            ]
        }));
    };

    /* ================= SSH TEST ================= */

    const handleTestSSH = async () => {

        setSshStatus("loading");
        setSshMessage("");

        if (!currentCluster) {
            setSshStatus("error");
            setSshMessage("Cluster chưa được chọn");
            return;
        }

        const payload = {
            clusterName: currentCluster.name,
            nodes: form.nodes
        };

        console.log("SSH payload:", payload);

        try {

            await coreApi.post("/create/ssh", payload);

            setSshStatus("success");
            setSshMessage("SSH kết nối thành công");

        } catch (err) {

            setSshStatus("error");
            setSshMessage(err.response?.data?.message || "SSH kết nối thất bại");

        }
    };

    /* ================= CREATE NODE ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentCluster) return;

        try {

            setProcessing(true);

            const payload = {
                clusterName: currentCluster.name,
                nodes: form.nodes
            };

            console.log("CREATE payload:", payload);

            await coreApi.post(`/create/${selectedClusterId}/workers`, payload);

            setProcessing(false);
            onOpenChange(false);
            window.location.reload();

        } catch (err) {

            console.error(err);
            setProcessing(false);

        } finally {
            setProcessing(false); // luôn chạy
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
              bg-white
                dark:from-gray-900 dark:to-gray-800
                border-2 border-indigo-300 dark:border-indigo-700
                shadow-2xl rounded-xl
                sm:max-w-[500px] p-8"
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold dark:text-black">
                        Thêm Node mới
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* NODE NAME */}
                    <div>
                        <Label className="dark:text-black">Tên Node</Label>
                        <Input
                            value={form.nodes[0].name}
                            onChange={(e) => updateNode("name", e.target.value)}
                            placeholder="worker-2"
                            required
                            className="dark:text-black"
                        />
                    </div>

                    {/* IP */}
                    <div>
                        <Label className="dark:text-black">IP Address</Label>
                        <Input
                            value={form.nodes[0].ip}
                            onChange={(e) => updateNode("ip", e.target.value)}
                            placeholder="192.168.235.144"
                            required
                            className="dark:text-black"
                        />
                    </div>

                    {/* USERNAME */}
                    <div>
                        <Label className="dark:text-black">SSH Username</Label>
                        <Input
                            value={form.nodes[0].user}
                            onChange={(e) => updateNode("user", e.target.value)}
                            placeholder="ubuntu"
                            required
                            className="dark:text-black"
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <Label className="dark:text-black">SSH Password</Label>
                        <Input
                            type="password"
                            value={form.nodes[0].ssh.password}
                            onChange={(e) => updateSSH("password", e.target.value)}
                            required
                            className="dark:text-black"
                        />
                    </div>

                    {/* SSH MESSAGE */}
                    {sshMessage && (
                        <div
                            className={`text-sm p-2 rounded ${sshStatus === "success"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                                }`}
                        >
                            {sshMessage}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>

                        {/* TEST SSH */}
                        {sshStatus !== "success" && (<Button
                            type="button"
                            onClick={handleTestSSH}
                            className="bg-blue-400 hover:bg-blue-600"
                            disabled={sshStatus === "loading"}
                        >
                            {sshStatus === "loading" ? "Testing..." : "Test SSH"}
                        </Button>
                        )}

                        {/* CREATE NODE */}
                        <Button
                            type="submit"
                            className="border-blue-400 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            disabled={processing}
                        >
                            {processing && (
                                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                            )}
                            {processing ? "Đang tạo..." : "Thêm Node"}
                        </Button>

                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}