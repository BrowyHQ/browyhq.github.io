// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves the repo at https://browyhq.github.io/docs/
  site: 'https://browyhq.github.io',
  base: '/docs',
  trailingSlash: 'ignore',
  integrations: [
    starlight({
      title: 'Browy',
      description: 'AI agent in your browser. Drives tabs, reads pages, writes code.',
      logo: { src: './src/assets/logo.png', replacesTitle: false },
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/BrowyHQ' },
      ],
      editLink: {
        baseUrl: 'https://github.com/BrowyHQ/docs/edit/main/',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'What is Browy?', slug: 'index' },
            { label: 'Install', slug: 'install' },
            { label: 'First chat', slug: 'first-chat' },
            { label: 'DevTools CLI', slug: 'devtools-cli' },
            { label: 'Terminal CLI (browy run)', slug: 'browy-run' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Permissions', slug: 'permissions' },
            { label: 'Tools the agent has', slug: 'tools' },
            { label: 'Privacy & Data', slug: 'privacy' },
            { label: 'Security', slug: 'security' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'Native host (backend)', slug: 'arch-backend' },
            { label: 'Extension (frontend)', slug: 'arch-frontend' },
            { label: 'DevTools CLI internals', slug: 'arch-cli' },
          ],
        },
        {
          label: 'Project',
          items: [
            { label: 'Changelog', slug: 'changelog' },
            { label: 'Roadmap & contributing', slug: 'roadmap' },
          ],
        },
      ],
    }),
  ],
});
