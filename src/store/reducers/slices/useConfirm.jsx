import { useState } from "react";
import ConfirmDialog from "../../../components/Pages/ConfirmDialog";


export default function useConfirm() {

    const [confirmState, setConfirmState] = useState({
        open: false,
        message: "",
        resolve: null
    });

    const confirm = (message) => {

        return new Promise((resolve) => {

            setConfirmState({
                open: true,
                message,
                resolve
            });

        });

    };

    const handleCancel = () => {

        confirmState.resolve?.(false);

        setConfirmState({
            open: false,
            message: "",
            resolve: null
        });

    };

    const handleConfirm = () => {

        confirmState.resolve?.(true);

        setConfirmState({
            open: false,
            message: null,
            resolve: null
        });

    };

    const ConfirmComponent = (
        <ConfirmDialog
            open={confirmState.open}
            message={confirmState.message}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
        />
    );

    return { confirm, ConfirmComponent };
}