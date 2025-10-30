/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ['./src/**/*.{html, js, ts, vue}', './src/**/*'],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB', // Teal primary color
                'primary-dark': '#2563EB',
                success: '#067647', // Green color for success states
                danger: '#d63c31', // Red for danger/error states
                warning: '#e6a23c', // Warning color
                info: '#344054', // Info color
                gray: {
                    50: '#F9FAFB',
                    100: '#F2F4F7',
                    200: '#EAECF0',
                    300: '#D0D5DD',
                    400: '#98A2B3',
                    500: '#667085',
                    600: '#475467',
                    700: '#344054',
                    800: '#1D2939',
                    900: '#101828',
                },
                'bg-1': '#F5F5F5',
                'bg-2': '#FCFCFD',
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                onest: ['Onest', 'sans-serif'],
            },
            borderRadius: {
                card: '12px',
                button: '8px',
                input: '8px',
            },
            boxShadow: {
                card: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
            },
        },
    },
    plugins: [],
}
