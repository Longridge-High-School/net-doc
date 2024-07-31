import {type MetaFunction, type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import path from 'path'
import fs from 'fs'

import {Button, AButton} from '~/lib/components/button'
import {Header} from '~/lib/components/header'
import {pageTitle} from '~/lib/utils/page-title'
import {ensureUser} from '~/lib/utils/ensure-user'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'system', {})

  const backupsDir = path.join(process.cwd(), 'public', 'backups')
  const files = await fs.promises.readdir(backupsDir)

  return json({user, files})
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('System')}]
}

const System = () => {
  const {files} = useLoaderData<typeof loader>()

  return (
    <div>
      <Header title="System" />
      <div className="grid grid-cols-2 gap-8">
        <div className="entry">
          <h2>Backup</h2>
          <ul>
            {files.map((name, i) => {
              return (
                <li key={i}>
                  <AButton className="bg-info mb-4" href={`/backups/${name}`}>
                    {name}
                  </AButton>
                </li>
              )
            })}
          </ul>
          <Button
            className="bg-success"
            onClick={() => {
              fetch('/api/backup')
            }}
          >
            Backup Now
          </Button>
          <p className="text-red-600">
            This backup does not include password hash keys, please record them
            seperately.
          </p>
        </div>
      </div>
    </div>
  )
}

export default System
