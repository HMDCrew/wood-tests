import { defineConfig } from 'vite';
import sass from 'sass';
import wasm from 'vite-plugin-wasm';
import plainText from 'vite-plugin-plain-text';

export default defineConfig({

    plugins: [
        wasm(),
        plainText([/\/LICENSE$/, '**/*.text', /\.glsl$/, /\.frag$/, /\.vert$/]),
    ],

    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                implementation: sass,
            },
        },
    },
});