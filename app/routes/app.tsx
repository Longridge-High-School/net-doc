import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
  Link,
  useNavigate
} from '@remix-run/react'
import {useHotkeys} from 'react-hotkeys-hook'
import {useState, useCallback} from 'react'
import {useMutation} from '@tanstack/react-query'

import {AButton, Button} from '~/lib/components/button'
import {Notificatons} from '~/lib/components/notifications'
import {Label, inputClasses} from '~/lib/components/input'

import {getPrisma} from '~/lib/prisma.server'
import {ensureUser} from '~/lib/utils/ensure-user'
import {canList} from '~/lib/rbac.server'
import {canFromList} from '~/lib/rbac'
import {getSettings} from '~/lib/settings.server'
import {contrastColor} from '~/lib/utils/contrast-color'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'app', {})

  const prisma = getPrisma()

  const assets = await prisma.asset.findMany({
    where: {sidebar: true},
    orderBy: {name: 'asc'}
  })

  const cans = await canList(user, [
    {index: 'asset-manager', operation: 'asset-manager:list', meta: {}},
    {index: 'field-manager', operation: 'field-manager:list', meta: {}},
    {index: 'user-manager', operation: 'user-manager:list', meta: {}},
    {index: 'acl-manager', operation: 'acl-manager:list', meta: {}},
    {index: 'system', operation: 'system', meta: {}},
    ...assets.map(({slug}) => {
      return {
        index: `asset:${slug}`,
        operation: 'asset:view',
        meta: {assetSlug: slug}
      }
    })
  ])

  const settings = await getSettings(['site-name', 'site-color', 'site-icon'])

  return json({user, assets, cans, settings})
}

export type AppLoader = {user: {name: string; id: string}}

const SearchModal = ({close}: {close: () => void}) => {
  const focusRef = useCallback((node: HTMLInputElement) => {
    if (node !== null) {
      node.focus()
    }
  }, [])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const search = useMutation<
    Array<{label: string; link: string}>,
    Error,
    string
  >({
    mutationFn: async (searchTerm: string) => {
      const formData = new FormData()
      formData.append('query', searchTerm)

      const response = await fetch('/app/search?_data=routes/app.search', {
        method: 'POST',
        body: formData
      })

      const json = await response.json()

      if (json.results.length === 1) {
        navigate(json.results[0].link)
        close()
      }

      return json.results
    }
  })

  return (
    <div className="fixed bg-white border-gray-300 border shadow-xl p-4 top-64 w-[60em] left-[calc(50%-30rem)]">
      <h2 className="text-[#444] text-2xl">Search</h2>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await search.mutateAsync(searchTerm)
        }}
      >
        <Label>
          <input
            name="query"
            ref={focusRef}
            className={inputClasses}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                close()
              }
            }}
            onChange={e => {
              setSearchTerm(e.target.value)
            }}
            disabled={search.isPending}
          />
        </Label>
        <Button className="bg-green-300">Search</Button>
        <Button type="button" onClick={close} className="bg-gray-300 ml-2">
          Cancel
        </Button>
      </form>
      <div className="flex gap-4 flex-wrap mt-4">
        {search.data
          ? search.data.map(({label, link}) => {
              return (
                <Link
                  key={link}
                  to={link}
                  className="bg-gray-300 p-2 rounded-sm"
                  onClick={close}
                >
                  {label}
                </Link>
              )
            })
          : ''}
      </div>
    </div>
  )
}

const Dashboard = () => {
  const {assets, user, cans, settings} = useLoaderData<typeof loader>()
  const [searchModalOpen, setSearchModelOpen] = useState(false)
  useHotkeys('ctrl+k', e => {
    e.preventDefault()
    setSearchModelOpen(!searchModalOpen)
  })

  return (
    <div className="grid grid-cols-dashboard min-h-screen gap-8">
      <Notificatons />
      {searchModalOpen ? (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-black/30">
          <SearchModal close={() => setSearchModelOpen(false)} />
        </div>
      ) : (
        ''
      )}
      <nav
        className="shadow-xl pt-8 text-[#444] print:hidden"
        style={{
          backgroundColor: settings['site-color'],
          color: contrastColor(settings['site-color'].replace('#', ''))
        }}
      >
        <img
          src={settings['site-icon']}
          alt={settings['site-name']}
          className="mb-8 mx-auto w-24 h-24"
        />
        <h1 className="text-center text-4xl mb-8">{settings['site-name']}</h1>
        <h2 className="text-xl ml-4 mb-4">Core</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          <Link to="/app">📜 Dashboard</Link>
          <Link to="/app/search">
            🔎 Search{' '}
            <span className="bg-gray-200 p-1 rounded-sm text-xs text-[#444]">
              Ctrl + K
            </span>
          </Link>
          <Link to="/app/documents">📰 Documents</Link>
          <Link to="/app/passwords">🔐 Passwords</Link>
          <Link to="/app/process">✔️ Process</Link>
        </div>
        <h2 className="text-xl ml-4">Assets</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          {assets.map(({id, name, slug, icon}) => {
            if (!canFromList(`asset:${slug}`, cans)) return

            return (
              <Link to={`/app/${slug}`} key={id}>
                {icon} {name}
              </Link>
            )
          })}
        </div>
        {canFromList('asset-manager', cans) ||
        canFromList('field-manager', cans) ||
        canFromList('user-manager', cans) ||
        canFromList('acl-manager', cans) ||
        canFromList('system', cans) ? (
          <h2 className="text-xl ml-4">System</h2>
        ) : (
          ''
        )}
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          {canFromList('acl-manager', cans) ? (
            <Link to="/app/acl-manager">🛂 ACL Manager</Link>
          ) : (
            ''
          )}
          {canFromList('asset-manager', cans) ? (
            <Link to="/app/asset-manager">📦 Asset Manager</Link>
          ) : (
            ''
          )}
          {canFromList('field-manager', cans) ? (
            <Link to="/app/field-manager">🚜 Field Manager</Link>
          ) : (
            ''
          )}
          {canFromList('user-manager', cans) ? (
            <Link to="/app/user-manager">👤 User Manager</Link>
          ) : (
            ''
          )}
          {canFromList('system', cans) ? (
            <Link to="/app/system">⚙️ System</Link>
          ) : (
            ''
          )}
        </div>
        <h2 className="text-xl ml-4">User</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          <Link to="/app/user">👤 {user.name}</Link>
          <Link to="/app/logout">👋 Logout</Link>
        </div>
      </nav>
      <div className="pt-8 pr-8 print:col-span-2">
        <Outlet />
      </div>
    </div>
  )
}

export default Dashboard

export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      return (
        <div className="w-96 m-auto mt-32">
          <h1 className="text-4xl text-center mb-8 text-danger">
            Access Denied
          </h1>
          <div className="bg-white rounded-xl shadow-xl p-2">
            <p className="mb-4">
              You do not have permission to view this page.
            </p>
            <AButton href="/app/login" className="w-full bg-success">
              Go to Login
            </AButton>
          </div>
        </div>
      )
    }

    if (error.status === 404) {
      return (
        <div className="w-96 m-auto mt-32">
          <h1 className="text-4xl text-center mb-8 text-info">Error 404</h1>
          <div className="bg-white rounded-xl shadow-xl p-2">
            <p className="mb-4">Page not found</p>
            <AButton href="/app" className="w-full bg-info">
              Back to the App
            </AButton>
          </div>
        </div>
      )
    }
  }

  console.dir({error})

  return (
    <div className="w-96 m-auto mt-32">
      <h1 className="text-4xl text-center mb-8 text-danger">Error</h1>
      <div className="bg-white rounded-xl shadow-xl p-2">
        <p className="mb-4">Something went wrong.</p>
        <div className="rounded-xl bg-gray-200 p-2">
          {error ? (error as {message: string}).message! : ''}
        </div>
        <div className="bg-gray-100 mt-4 rounded-xl p-2">
          {error ? (error as {stack: string}).stack! : ''}
        </div>
      </div>
    </div>
  )
}
