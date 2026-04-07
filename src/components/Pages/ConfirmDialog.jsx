import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from "@mui/material";

export default function ConfirmDialog({
    open,
    title,
    message,
    onCancel,
    onConfirm
}) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>

            <DialogTitle>
                {title || "Confirm"}
            </DialogTitle>

            <DialogContent>

                <Typography>
                    {message}
                </Typography>

            </DialogContent>

            <DialogActions>

                <Button onClick={onCancel}>
                    Cancel
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    onClick={onConfirm}
                >
                    Confirm
                </Button>

            </DialogActions>

        </Dialog>
    );
}