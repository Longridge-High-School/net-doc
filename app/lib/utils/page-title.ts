import {type MetaArgs} from '@remix-run/node'

export const pageTitle = (matches: MetaArgs['matches'], ...parts: string[]) => {
  const appName = (
    matches.filter(match => match.pathname === '/app')[0].data as {
      settings: {'site-name': string}
    }
  ).settings['site-name']

  return [appName, ...parts].join(' / ')
}
