import {cssBundleHref} from '@remix-run/css-bundle'
import type {LinksFunction} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

import {Notifications} from '~/lib/hooks/use-notify'

import rootCSS from './styles/root.css'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
  {rel: 'stylesheet', href: rootCSS}
]

const queryClient = new QueryClient()

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Notifications>
            <Outlet />
          </Notifications>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
