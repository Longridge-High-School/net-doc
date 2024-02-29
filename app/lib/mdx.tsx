import {useMemo} from 'react'
import {getMDXComponent} from 'mdx-bundler/client/index.js'

export const MDXComponent = ({code}: {code: string}) => {
  const Component = useMemo(() => getMDXComponent(code), [code])

  return <Component />
}
