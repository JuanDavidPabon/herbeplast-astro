// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	build: {
		// Mantiene las rutas .html existentes al migrar el resto de páginas.
		format: 'file',
	},
});
