import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";

export default function ScaleDialog({
    open,
    onClose,
    deploymentName,
    replicas,
    setReplicas,
    onScale
}) {

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

            <DialogTitle>
                Scale {deploymentName}
            </DialogTitle>

            <DialogContent >

                <TextField
                    label="Replicas"
                    type="number"
                    fullWidth
                    value={replicas}
                    onChange={(e) => setReplicas(e.target.value)}
                    sx={{ mt: 2 }}
                    inputProps={{
                        min: 0,
                        step: 1,
                    }}
                />

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onScale}
                >
                    Scale
                </Button>

            </DialogActions>

        </Dialog>
    );
}