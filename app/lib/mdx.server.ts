import {bundleMDX} from 'mdx-bundler'

export const buildMDXBundle = async (mdx: string) => {
  const {code} = await bundleMDX({source: mdx})

  return code
}
