import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const SITE = 'https://browyhq.github.io';

export async function GET(context) {
  const docs = await getCollection('docs');

  const posts = docs
    .filter((entry) => {
      const id = entry.id;
      // English posts only for the default feed; zh-CN handled separately.
      return (
        id.startsWith('blog/') &&
        !id.startsWith('blog/index') &&
        !id.startsWith('zh-cn/')
      );
    })
    .map((entry) => {
      const pubISO =
        entry.data.head?.find?.(
          (h) => h.tag === 'meta' && h.attrs?.property === 'article:published_time',
        )?.attrs?.content ?? null;
      return {
        title: entry.data.title,
        description: entry.data.description ?? '',
        link: `/${entry.id.replace(/^blog\//, 'blog/').replace(/\.mdx?$/, '')}/`,
        pubDate: pubISO ? new Date(pubISO) : new Date(),
      };
    })
    .sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: 'Browy blog',
    description:
      'Notes on AI agents, browser automation, open-source infrastructure, and the slow rebuilding of friction on the public internet.',
    site: context.site ?? SITE,
    items: posts,
    customData: `<language>en-us</language>`,
  });
}
