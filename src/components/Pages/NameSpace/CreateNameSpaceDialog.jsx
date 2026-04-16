import { useState } from "react";
import { useDispatch } from "react-redux";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";

import { useSnackbar } from "notistack";
import { createNamespace, fetchNamespaces } from "../../../store/reducers/slices/namespaceSlice";


export default function CreateNamespaceDialog({
    open,
    onOpenChange
}) {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const validateNamespace = (value) => {

        const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

        if (!value) {
            return "Namespace không được để trống";
        }

        if (value.length > 63) {
            return "Namespace tối đa 63 ký tự";
        }

        if (!regex.test(value)) {
            return "Namespace chỉ gồm a-z, 0-9 và dấu -";
        }

        return "";
    };

    const handleCreate = async () => {

        const validationError = validateNamespace(name);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            await dispatch(
                createNamespace({
                    name: name.trim()
                })
            ).unwrap();

            enqueueSnackbar("Tạo namespace thành công", {
                variant: "success",
                autoHideDuration: 2000
            });

            dispatch(fetchNamespaces());

            setName("");
            setError("");
            onOpenChange(false);

        } catch (err) {

            enqueueSnackbar(err || "Tạo namespace thất bại", {
                variant: "error",
                autoHideDuration: 2000
            });

        }
    };

    const handleClose = () => {

        setName("");
        setError("");
        onOpenChange(false);

    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>

            <DialogTitle>
                Tạo Namespace
            </DialogTitle>

            <DialogContent>

                <TextField
                    label="Namespace name"
                    placeholder="ví dụ: test"
                    fullWidth
                    value={name}
                    onChange={(e) => {

                        const value = e.target.value.toLowerCase();

                        setName(value);
                        setError(validateNamespace(value));

                    }}
                    error={!!error}
                    helperText={error || "Chỉ dùng a-z, 0-9, -"}
                    sx={{ mt: 2 }}
                />

            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleCreate}
                    className="border-blue-400 text-blue-600 hover:bg-blue-50"
                    disabled={!name || !!error}
                >
                    Create
                </Button>

            </DialogActions>

        </Dialog>
    );
}