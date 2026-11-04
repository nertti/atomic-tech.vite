import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { requestKinds, serviceGroups, mobileServiceGroups, homeCases, caseCategories, whyPoints, processSteps, teamMembers, homeVideo, reviewRows, blogArticles } from './src/data/home-content.js'
import { serviceCycle, serviceSteps, serviceScenarios, serviceResponsibilities, serviceFaq } from './src/data/service-content.js'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    base: './',
    appType: 'mpa',

    plugins: [
        handlebars({
            partialDirectory: resolve(root, 'src/partials'),
            context: pagePath => ({ requestKinds, serviceGroups, mobileServiceGroups, homeCases, caseCategories, whyPoints, processSteps, teamMembers, homeVideo, reviewRows, blogArticles, serviceCycle, serviceSteps, serviceScenarios, serviceResponsibilities, serviceFaq, isServicePage: pagePath.endsWith('service.html') }),
            helpers: {
                serviceHref: title => ['Веб-разработка', 'Веб-разработка под ключ'].includes(title) ? 'service.html' : '#contact',
            },
        }),
    ],
    build: {
        outDir: 'docs',
        rolldownOptions: {
            input: {
                home: resolve(root, 'index.html'),
                service: resolve(root, 'service.html'),
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
