// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Project page at https://valley-christian-startup-incubator.github.io/website/
  site: 'https://valley-christian-startup-incubator.github.io',
  base: '/website',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});