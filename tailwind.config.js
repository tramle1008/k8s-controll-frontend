/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',          // ← quan trọng nhất cho dark mode bằng class
    theme: {
        extend: {
            // Bạn có thể thêm custom colors, fonts, spacing... ở đây sau
            colors: {
                // Ví dụ giữ nguyên các biến màu bạn đang dùng
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: 'hsl(var(--card))',
                muted: 'hsl(var(--muted))',
                primary: 'hsl(var(--primary))',
                border: 'hsl(var(--border))',
            },
        },
    },
    plugins: [],
}