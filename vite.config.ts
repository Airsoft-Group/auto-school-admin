import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import { svgBuilder } from './src/components/icon/svg/index'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import tailwindcss from 'tailwindcss'

const pathResolve = (dir: string): string => {
    return resolve(__dirname, '.', dir)
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
    // Load env file based on `mode` in the current working directory
    const env = loadEnv(mode, process.cwd())
    const isProd = mode === 'production'
    
    // Define aliases for imports
    const alias: Record<string, string> = {
        '@': pathResolve('./src/'),
        'assets': pathResolve('./src/assets'),
        'vue-i18n': isProd ? 'vue-i18n/dist/vue-i18n.cjs.prod.js' : 'vue-i18n/dist/vue-i18n.cjs.js',
    }
    
    return {
        plugins: [
            vue(),
            svgBuilder('./src/assets/images/icons/'),
            VueI18nPlugin({
                include: resolve(dirname(fileURLToPath(import.meta.url)), './src/assets/locales/**'),
            }),
        ],
        resolve: { alias },
        build: {
            sourcemap: false,
            outDir: env.VITE_OUT_DIR || 'dist',
            emptyOutDir: true,
            chunkSizeWarningLimit: 1500,
        },
        css: {
            postcss: {
                plugins: [
                    tailwindcss as any,
                    {
                        postcssPlugin: 'internal:charset-removal',
                        AtRule: {
                            charset: (atRule: any) => {
                                if (atRule.name === 'charset') {
                                    atRule.remove()
                                }
                            },
                        },
                    },
                ],
            },
        },
    }
})
