import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { resolve } from 'path'

export default defineConfig({
    // Указываем Vite использовать относительные пути для сборки
    base: './',

    plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'src/partials'),
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                projects: resolve(__dirname, 'projects.html'),
                detail: resolve(__dirname, 'detail.html'),
                notFound: resolve(__dirname, '404.html'),
                policy: resolve(__dirname, 'policy.html'),
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name].js',
                assetFileNames: (assetInfo) => {
                    if (!assetInfo.name) return 'assets/[name].[ext]';
                    const name = assetInfo.name;
                    if (name.endsWith('.css')) return 'css/[name].[ext]';
                    if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) return 'img/[name].[ext]';
                    if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'fonts/[name].[ext]';
                    return 'assets/[name].[ext]';
                },
            },
        },
    },
})
