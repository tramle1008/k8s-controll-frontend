// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    colorSchemeSelector: 'class',  // theo class .light / .dark trên html (giống Tailwind)
    colorSchemes: {
        light: true,
        dark: true,
    },
    // Optional: custom DataGrid nếu cần override sâu hơn
    components: {
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 0,
                },
            },
        },
    },
});

export default theme;