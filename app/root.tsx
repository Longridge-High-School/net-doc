import {Links, Meta, Outlet, Scripts, ScrollRestoration} from '@remix-run/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {type HeadersFunction} from '@remix-run/node'

import {Notifications} from '~/lib/hooks/use-notify'

import './styles/root.css'

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
      </body>
    </html>
  )
}
