import { Box, Button, TextField, MenuItem, Select, InputAdornment } from "@mui/material";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const ResourceToolbar = ({
    search,
    onSearchChange,
    namespace,
    onNamespaceChange,
    onRefresh,
    onCreate,
    onImport
}) => {
    const BACKEND_URL =
        import.meta.env.VITE_BACK_END_URL || "http://localhost:8080";

    const [namespaces, setNamespaces] = useState([]);

    /* FETCH NAMESPACE */

    useEffect(() => {

        const fetchNamespaces = async () => {

            try {

                const res = await fetch(`${BACKEND_URL}/api/namespaces`);

                if (!res.ok) throw new Error();

                const data = await res.json();

                setNamespaces(data);

            } catch (err) {

                console.error("Load namespaces failed", err);

            }

        };

        fetchNamespaces();

    }, []);
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                gap: 2
            }}
        >

            {/* SEARCH */}
            <TextField
                placeholder="Search theo tên"
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                sx={{
                    width: 320,
                    "& .MuiInputBase-root": {
                        height: 40
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    )
                }}
            />

            {/* NAMESPACE FILTER */}
            {/* viết thêm fetch ở đây để truyền namespace vào */}

            <Select
                size="small"
                value={namespace}
                onChange={(e) => onNamespaceChange?.(e.target.value)}
                sx={{ minWidth: 200 }}
            >

                <MenuItem value="all">All Namespaces</MenuItem>

                {namespaces.map((ns) => (

                    <MenuItem key={ns.name} value={ns.name}>
                        {ns.name}
                    </MenuItem>

                ))}

            </Select>

            {/* ACTION BUTTONS */}
            <Box sx={{ display: "flex", gap: 1 }}>

                {onRefresh && (
                    <Button variant="outlined" onClick={onRefresh}>
                        Refresh
                    </Button>
                )}

                {onImport && (
                    <Button variant="outlined" onClick={onImport}>
                        Import
                    </Button>
                )}

                {onCreate && (
                    <Button variant="contained" onClick={onCreate}>
                        Create
                    </Button>
                )}

            </Box>

        </Box>
    );
};

export default ResourceToolbar;