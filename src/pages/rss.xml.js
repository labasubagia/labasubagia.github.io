/* eslint-disable @typescript-eslint/explicit-function-return-type */
import rss from '@astrojs/rss'
import sanitizeHtml from 'sanitize-html'

export async function GET(context) {
  const postImportResult = import.meta.glob('./posts/**/*.{md,mdx}', {
    eager: true,
  })
  const posts = Object.values(postImportResult)
  return await rss({
    title: `Laba's Blog`,
    description: `Laba's Blog`,
    site: context.site,
    items: posts.map((post) => ({
      link: post.url,
      content: sanitizeHtml(post.compiledContent()),
      ...post.frontmatter,
    })),
  })
}
