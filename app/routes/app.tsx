import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData
} from '@remix-run/react'

import {AButton} from '~/lib/components/button'

import {getPrisma} from '~/lib/prisma.server'
import {ensureUser} from '~/lib/utils/ensure-user'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'app', {})

  const prisma = getPrisma()

  const assets = await prisma.asset.findMany({orderBy: {name: 'asc'}})

  return json({user, assets})
}

export type AppLoader = {user: {name: string; id: string}}

const Dashboard = () => {
  const {assets} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-dashboard min-h-screen gap-8">
      <nav className="bg-gray-300 shadow-xl pt-8 text-[#444]">
        <h1 className="text-center text-4xl mb-8">Net Doc</h1>
        <h2 className="text-xl ml-4 mb-4">Core</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          <a href="/app">📜 Dashboard</a>
          <a href="/app/search">🔎 Search</a>
          <a href="/app/documents">📰 Documents</a>
          <a href="/app/passwords">🔐 Passwords</a>
        </div>
        <h2 className="text-xl ml-4">Assets</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          {assets.map(({id, name, slug, icon}) => {
            return (
              <a href={`/app/${slug}`} key={id}>
                {icon} {name}
              </a>
            )
          })}
        </div>
        <h2 className="text-xl ml-4">System</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          <a href="/app/asset-manager">📦 Asset Manager</a>
          <a href="/app/field-manager">🚜 Field Manager</a>
          <a href="/app/user-manager">👤 User Manager</a>
        </div>
        <h2 className="text-xl ml-4">User</h2>
        <div className="pl-8 mb-2 flex flex-col gap-2 mt-2">
          <a href="/app/logout">👋 Logout</a>
        </div>
      </nav>
      <div className="pt-8">
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

  return <div>ERROR</div>
}
