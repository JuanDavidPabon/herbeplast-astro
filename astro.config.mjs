// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	build: {
		// Mantiene las rutas .html existentes al migrar el resto de páginas.
		format: 'file',
	},

	adapter: cloudflare(),
});
