import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { fetchPosts } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';
import { SITE, METADATA } from '~/utils/config';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = await fetchPosts();
  const siteUrl = String(context.site ?? SITE.site);
  return rss({
    title: `${SITE.name} Blog`,
    description: METADATA.description,
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt ?? '',
      link: new URL(getPermalink(post.permalink, 'post'), siteUrl).href,
      pubDate: post.publishDate,
      categories: [...(post.category ? [post.category] : []), ...(post.tags ?? [])],
    })),
    customData: '<language>en</language>',
  });
};
