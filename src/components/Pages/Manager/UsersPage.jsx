import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Typography,
    IconButton, Box, Button, Card, CardContent, Stack
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import useConfirm from "../../../store/reducers/slices/useConfirm";
import { coreApi } from "../../../api/api";
import CreateUserDialog from "./CreateUserDialog";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { confirm, ConfirmComponent } = useConfirm();
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [userCreated, setUserCreated] = useState(false);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await coreApi.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true); // optional: show loading khi xóa
            await coreApi.delete(`/users/${userId}`);
            // Xóa thành công, fetch lại users
            await fetchUsers();
        } catch (err) {
            console.error("Xóa user thất bại:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleUserCreated = () => {
        setUserCreated(true);
        setOpenCreateDialog(false);
    };

    useEffect(() => {
        if (userCreated) {
            fetchUsers();
            setUserCreated(false); // reset
        }
    }, [userCreated]);

    return (
        <Box sx={{ p: 3 }}>
            {/* Card bao ngoài giống manager page */}
            <Card elevation={3}>
                <CardContent>
                    {/* Header: Title + Add User Button */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="h5" fontWeight={700}>
                            Danh sách người dùng
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenCreateDialog(true)}
                        >
                            Tạo User
                        </Button>
                    </Stack>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center"><strong>ID</strong></TableCell>
                                    <TableCell align="center"><strong>Username</strong></TableCell>
                                    <TableCell align="center"><strong>Role</strong></TableCell>
                                    <TableCell align="center"><strong>Cluster Name</strong></TableCell>
                                    <TableCell align="center"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={28} />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Chưa có người dùng nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell align="center">{user.id}</TableCell>
                                            <TableCell align="center">{user.username}</TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                                    {user.userRole === "ADMIN" ? (
                                                        <>
                                                            <AdminPanelSettingsIcon sx={{ color: "#1976d2" }} />
                                                            Quản trị
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PersonIcon sx={{ color: "gray" }} />
                                                            Người dùng
                                                        </>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center" >
                                                {user.clusterName ? user.clusterName : "-"}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="error"
                                                    onClick={async () => {
                                                        if (await confirm(
                                                            <>
                                                                Bạn có chắc muốn xóa người dùng{" "}
                                                                <span className="message-highlight">{user.username}</span>?
                                                            </>
                                                        )) {
                                                            handleDeleteUser(user.id);
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {ConfirmComponent}
            <CreateUserDialog
                open={openCreateDialog}
                onOpenChange={setOpenCreateDialog}
                defaultClusterId={1}
                onSuccess={handleUserCreated}
            />
        </Box>
    );
};

export default UsersPage;