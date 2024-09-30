import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  useFetchers
} from '@remix-run/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useEffect} from 'react'
import NProgress from 'nprogress'

import {Notifications} from '~/lib/hooks/use-notify'

import './styles/root.css'

const queryClient = new QueryClient()

export default function App() {
  const navigation = useNavigation()
  const fetchers = useFetchers()
  useEffect(() => {
    const fetchersIdle = fetchers.every(f => f.state === 'idle')
    if (navigation.state === 'idle' && fetchersIdle) {
      NProgress.done()
    } else {
      NProgress.start()
    }
  }, [navigation.state, fetchers])

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
