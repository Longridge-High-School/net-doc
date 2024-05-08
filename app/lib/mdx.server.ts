import {bundleMDX} from 'mdx-bundler'
import remarkGfm from 'remark-gfm'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'

export const buildMDXBundle = async (mdx: string) => {
  const {code} = await bundleMDX({
    source: mdx,
    mdxOptions: options => {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        rehypeAutolinkHeadings
      ]

      return options
    }
  })

  return code
}
