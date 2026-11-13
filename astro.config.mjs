// @ts-check  ← lets VS Code type-check this JS file and autocomplete config options
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// `npx astro add vue` adds the integration below (and installs the packages) for you.
export default defineConfig({
  integrations: [vue()],
});
