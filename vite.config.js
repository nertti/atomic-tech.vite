import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { requestKinds, serviceGroups, homeCases, caseCategories, whyPoints, processSteps, teamMembers, homeVideo, reviewRows, blogArticles } from './src/data/home-content.js'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    base: './',
    appType: 'mpa',

    plugins: [
        handlebars({
            partialDirectory: resolve(root, 'src/partials'),
            context: { requestKinds, serviceGroups, homeCases, caseCategories, whyPoints, processSteps, teamMembers, homeVideo, reviewRows, blogArticles },
        }),
    ],
    build: {
        outDir: 'docs',
        rolldownOptions: {
            input: {
                home: resolve(root, 'index.html'),
                projects: resolve(root, 'projects.html'),
                detail: resolve(root, 'detail.html'),
                notFound: resolve(root, '404.html'),
                policy: resolve(root, 'policy.html'),
            },
            output: {
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.names?.[0] ?? ''
                    if (name.endsWith('.css')) return 'css/[name]-[hash][extname]'
                    if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) return 'img/[name]-[hash][extname]'
                    if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) return 'fonts/[name]-[hash][extname]'
                    return 'assets/[name]-[hash][extname]'
                },
            },
        },
    },
})
