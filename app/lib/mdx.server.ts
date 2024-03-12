import {bundleMDX} from 'mdx-bundler'
import remarkGfm from 'remark-gfm'

export const buildMDXBundle = async (mdx: string) => {
  const {code} = await bundleMDX({
    source: mdx,
    mdxOptions: options => {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]

      return options
    }
  })

  return code
}
