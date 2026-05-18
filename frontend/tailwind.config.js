/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans"', '"Noto Sans Tamil"', '"Noto Sans Devanagari"', 'sans-serif'],
            },
            colors: {
                'farm-green': '#2ecc71',
                'earth-brown': '#795548',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
