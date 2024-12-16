import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import unocss from 'unocss/astro'
import icon from "astro-icon";
import { BASE_URL } from './src/config'
import { remarkPlugins, rehypePlugins } from './src/plugins';

// https://astro.build/config
export default defineConfig({
	site: BASE_URL,
	integrations: [
    mdx(),
    sitemap({ filter: page => ['/tags/','/categories/'].map(PATH=>page.startsWith(BASE_URL+PATH)).includes(false) }),
    unocss({ injectReset: true, configFile: '/uno.config.ts' }),
    icon()
  ],
  markdown: {
    remarkPlugins,
    rehypePlugins
  }
});
