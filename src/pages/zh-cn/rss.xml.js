import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const SITE = 'https://browyhq.github.io';

export async function GET(context) {
  const docs = await getCollection('docs');

  const posts = docs
    .filter((entry) => entry.id.startsWith('zh-cn/blog/'))
    .map((entry) => {
      const pubISO =
        entry.data.head?.find?.(
          (h) => h.tag === 'meta' && h.attrs?.property === 'article:published_time',
        )?.attrs?.content ?? null;
      return {
        title: entry.data.title,
        description: entry.data.description ?? '',
        link: `/${entry.id.replace(/\.mdx?$/, '')}/`,
        pubDate: pubISO ? new Date(pubISO) : new Date(),
      };
    })
    .sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: 'Browy 博客',
    description:
      '关于 AI 智能体、浏览器自动化、开源基础设施，以及公共互联网上重新建立摩擦的笔记。',
    site: context.site ?? SITE,
    items: posts,
    customData: `<language>zh-cn</language>`,
  });
}
