// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves the org-page repo (BrowyHQ/browyhq.github.io) at the root.
  site: 'https://browyhq.github.io',
  trailingSlash: 'ignore',
  // Keep old /docs/* inbound links working (CWS listing, manifest homepage_url,
  // YouTube descriptions, README backlinks). Astro emits client-side meta-refresh
  // redirect pages at build time.
  redirects: {
    '/docs': '/',
    '/docs/': '/',
    '/docs/[...slug]': '/[...slug]',
  },
  integrations: [
    starlight({
      title: 'Browy',
      description: 'The AI agent that lives in your browser. Drives real tabs through chat. Side panel + DevTools REPL.',
      logo: { src: './src/assets/logo.png', replacesTitle: false },
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        'zh-cn': { label: '简体中文', lang: 'zh-CN' },
      },
      // Global head injection — runs on every page. Per-page frontmatter
      // `head:` blocks are appended after this and can override.
      head: [
        // Default social card so link previews aren't blank.
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://browyhq.github.io/og-default.png' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://browyhq.github.io/og-default.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#0a1f12' } },
        // Canonical author for blog posts (overridable per-post)
        { tag: 'meta', attrs: { name: 'author', content: 'Ritabrata Maiti' } },
        // Google Search Console domain verification.
        { tag: 'meta', attrs: { name: 'google-site-verification', content: 'KTuHyXaGSJO9UWwBUrqMv_QU__MMir4-TcJjPjofGCI' } },
      ],
      components: {
        Hero: './src/components/Hero.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/BrowyHQ' },
      ],
      editLink: {
        baseUrl: 'https://github.com/BrowyHQ/browyhq.github.io/edit/main/',
      },
      sidebar: [
        {
          label: 'Start Here',
          translations: { 'zh-CN': '从这里开始' },
          items: [
            { label: 'What is Browy?', translations: { 'zh-CN': 'Browy 是什么？' }, slug: 'index' },
            { label: 'Install', translations: { 'zh-CN': '安装' }, slug: 'install' },
            { label: 'China setup', translations: { 'zh-CN': '中国开发者指南' }, slug: 'china-setup' },
            { label: 'First chat', translations: { 'zh-CN': '第一次对话' }, slug: 'first-chat' },
            { label: 'DevTools CLI', slug: 'devtools-cli' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'zh-CN': '参考' },
          items: [
            { label: 'Permissions', translations: { 'zh-CN': '权限说明' }, slug: 'permissions' },
            { label: 'Tools the agent has', translations: { 'zh-CN': '可用工具' }, slug: 'tools' },
            { label: 'Privacy & Data', translations: { 'zh-CN': '隐私与数据' }, slug: 'privacy' },
            { label: 'Security', translations: { 'zh-CN': '安全' }, slug: 'security' },
          ],
        },
        {
          label: 'Architecture',
          translations: { 'zh-CN': '架构' },
          items: [
            { label: 'Native host (backend)', slug: 'arch-backend' },
            { label: 'Extension (frontend)', slug: 'arch-frontend' },
            { label: 'DevTools CLI internals', slug: 'arch-cli' },
          ],
        },
        {
          label: 'Project',
          translations: { 'zh-CN': '项目' },
          items: [
            { label: 'FAQ', translations: { 'zh-CN': '常见问题' }, slug: 'faq' },
            { label: 'Changelog', translations: { 'zh-CN': '更新日志' }, slug: 'changelog' },
            { label: 'Roadmap & contributing', translations: { 'zh-CN': '路线图与贡献' }, slug: 'roadmap' },
          ],
        },
        {
          label: 'Writing',
          translations: { 'zh-CN': '博客' },
          items: [
            { label: 'Blog', translations: { 'zh-CN': '博客' }, slug: 'blog' },
          ],
        },
      ],
    }),
    sitemap({
      // Drop the .new staging file if any and the OG image binaries from sitemap.
      filter: (page) => !page.includes('/.well-known/') && !page.endsWith('.png'),
    }),
  ],
});
