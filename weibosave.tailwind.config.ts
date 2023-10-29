import type { Config } from 'tailwindcss'

const config: Config = {
    important: '#weibo-extend-weibosave',
    content: [
        './weiboSave/**/*.html',
        './weiboSave/**/*.ts',
        "./node_modules/tailwind-datepicker-react/dist/**/*.js", 
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
export default config
