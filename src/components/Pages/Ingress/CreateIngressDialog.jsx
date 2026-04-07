import { useState } from "react";
import { useSnackbar } from "notistack";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import { coreApi } from "../../../api/api";

export default function CreateIngressDialog({ open, onOpenChange, onCreated }) {
    const { enqueueSnackbar } = useSnackbar();

    const [processing, setProcessing] = useState(false);

    const [form, setForm] = useState({
        controller: "nginx",
        name: ""
    });

    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const buildPayload = () => {
        let controllerValue = form.controller;
        if (form.controller === "nginx") controllerValue = "k8s.io/ingress-nginx";
        if (form.controller === "kong") controllerValue = "ingress-controllers.konghq.com/kong";
        // custom sẽ dùng chính form.controller

        return {
            name: form.name.trim(),
            controller: controllerValue
        };
    };

    const resetForm = () => {
        setForm({ controller: "nginx", name: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            enqueueSnackbar("Vui lòng nhập tên IngressClass!", { variant: "warning" });
            return;
        }

        try {
            setProcessing(true);
            const payload = buildPayload();
            await coreApi.post("/ingress-class", payload);

            enqueueSnackbar("IngressClass created successfully", { variant: "success", autoHideDuration: 1000 });
            onCreated?.();
            onOpenChange(false);
            resetForm();
        } catch (err) {
            console.error(err);
            enqueueSnackbar(err?.response?.data || "Failed to create IngressClass", { variant: "error", autoHideDuration: 1200 });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create IngressClass</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label>Ingress Controller</Label>
                            <Select value={form.controller} onValueChange={value => updateField("controller", value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select controller" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nginx">NGINX</SelectItem>
                                    <SelectItem value="kong">Kong</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>IngressClass Name</Label>
                            <Input
                                className="w-full"
                                value={form.name}
                                onChange={e => updateField("name", e.target.value)}
                                placeholder="vd: my-nginx-class"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="outline" disabled={processing}>
                            {processing ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}