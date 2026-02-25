import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
/** Torna os CSS não bloqueantes: carrega com media="print" e troca para "all" no onload. */
function nonBlockingCss() {
    return {
        name: 'non-blocking-css',
        transformIndexHtml(html) {
            return html.replace(/<link rel="stylesheet"([^>]*?)>/gi, (fullTag) => {
                if (fullTag.includes('media='))
                    return fullTag;
                return fullTag.replace(/>\s*$/, ' media="print" onload="this.media=\'all\'">');
            });
        },
    };
}
/** Script no final do body para o primeiro paint (shell) acontecer antes do JS. */
function scriptAtBodyEnd() {
    return {
        name: 'script-at-body-end',
        transformIndexHtml(html) {
            const scriptRegex = /<script type="module"([^>]*?)><\/script>\s*/g;
            const scripts = [];
            let newHtml = html.replace(scriptRegex, (match) => {
                scripts.push(match.trim());
                return '';
            });
            if (scripts.length) {
                newHtml = newHtml.replace('</body>', `${scripts.join('\n  ')}\n</body>`);
            }
            return newHtml;
        },
    };
}
export default defineConfig({
    plugins: [
        react(),
        nonBlockingCss(),
        scriptAtBodyEnd(),
        VitePWA({
            registerType: 'prompt',
            scope: '/fintrack/',
            manifest: {
                name: 'Fintrack',
                short_name: 'Fintrack',
                description: 'Aplicativo de controle financeiro pessoal',
                theme_color: '#1e293b',
                background_color: '#0f172a',
                display: 'standalone',
                start_url: '/fintrack/',
                scope: '/fintrack/',
                icons: [
                    { src: '/fintrack/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                navigateFallback: '/fintrack/index.html',
            },
        }),
    ],
    base: '/fintrack/',
    build: {
        outDir: 'docs',
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules/react'))
                        return 'vendor-react';
                    if (id.includes('node_modules/@tanstack/react-query'))
                        return 'react-query';
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    }
});
