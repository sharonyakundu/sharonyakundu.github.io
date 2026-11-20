import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` is the public address. Astro uses it to write correct links
// in the sitemap and in the tags that search engines read.
export default defineConfig({
  site: 'https://sharonyakundu.github.io',
  integrations: [sitemap()],
});
