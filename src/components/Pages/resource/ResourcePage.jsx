import { Box, Typography } from "@mui/material";

const ResourcePage = ({ title, toolbar, children }) => {
    return (
        <Box
            sx={{
                p: 2,
                color: "text.primary",
            }}
        >
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>

            {toolbar && (
                <Box sx={{ mb: 2 }}>
                    {toolbar}
                </Box>
            )}

            {children}
        </Box>
    );
};

export default ResourcePage;