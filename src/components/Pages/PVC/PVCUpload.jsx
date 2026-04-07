import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography
} from "@mui/material";

import { uploadPVCFile, fetchPVCs } from "../../../store/reducers/slices/pvcSlice";

const PVCUpload = ({ open, onOpenChange, onUploaded }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            enqueueSnackbar("Vui lòng chọn file YAML", {
                variant: "warning",
                autoHideDuration: 1200
            });
            return;
        }

        try {
            setProcessing(true);

            await dispatch(uploadPVCFile(file)).unwrap();
            await dispatch(fetchPVCs());

            enqueueSnackbar("Upload PVC YAML thành công", {
                variant: "success",
                autoHideDuration: 1000
            });

            onUploaded?.();
            onOpenChange(false);
            setFile(null);
        } catch (err) {
            enqueueSnackbar(`Upload thất bại: ${err}`, {
                variant: "error",
                autoHideDuration: 1200
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => onOpenChange(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Upload PVC YAML</DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <Button variant="outlined" component="label">
                        Chọn file YAML
                        <input
                            type="file"
                            hidden
                            accept=".yaml,.yml"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </Button>

                    <Typography variant="body2">
                        {file ? file.name : "Chưa chọn file"}
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={processing}
                >
                    {processing ? "Uploading..." : "Upload"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PVCUpload;