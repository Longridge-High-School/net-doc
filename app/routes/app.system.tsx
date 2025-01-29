import {
  type MetaFunction,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import path from 'path'
import fs from 'fs'
import {invariant} from '@arcath/utils'

import {Button, AButton} from '~/lib/components/button'
import {Header} from '~/lib/components/header'
import {pageTitle} from '~/lib/utils/page-title'
import {ensureUser} from '~/lib/utils/ensure-user'
import {getSettings, setSetting} from '~/lib/settings.server'
import {HelperText, Input, Label} from '~/lib/components/input'
import {getUploadHandler} from '~/lib/utils/upload-handler.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'system', {})

  const backupsDir = path.join(process.cwd(), 'public', 'backups')
  const files = await fs.promises.readdir(backupsDir)

  const settings = await getSettings(['site-name', 'site-color'])

  return {user, files, settings}
}

export const action = async ({request}: ActionFunctionArgs) => {
  await ensureUser(request, 'system', {})

  const uploadHandler = getUploadHandler()

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const settings = await getSettings(['site-name', 'site-color'])

  const siteName = formData.get('site-name') as string | undefined
  const siteColor = formData.get('site-color') as string | undefined
  const siteIcon = formData.get('site-icon') as unknown as
    | {filepath: string; type: string}
    | undefined

  invariant(siteName)
  invariant(siteColor)

  if (siteName !== settings['site-name']) {
    await setSetting('site-name', siteName)
  }

  if (siteColor !== settings['site-color']) {
    await setSetting('site-color', siteColor)
  }

  if (siteIcon && siteIcon.filepath) {
    const fileName = path.basename(siteIcon.filepath)

    await setSetting('site-icon', `/uploads/${fileName}`)
  }

  return redirect('/app/system')
}

export const meta: MetaFunction = ({matches}) => {
  return [{title: pageTitle(matches, 'System')}]
}

const System = () => {
  const {files, settings} = useLoaderData<typeof loader>()

  return (
    <div>
      <Header title="System" />
      <div className="grid grid-cols-2 gap-8">
        <div className="entry">
          <h2>System Settings</h2>
          <form method="POST" encType="multipart/form-data">
            <Label>
              Site Name
              <Input name="site-name" defaultValue={settings['site-name']} />
              <HelperText>This defaults to &quot;Net Doc&quot;</HelperText>
            </Label>
            <Label>
              Site Color
              <Input
                name="site-color"
                defaultValue={settings['site-color']}
                type="color"
                className="h-12"
              />
              <HelperText>This color is used for the sidebar.</HelperText>
            </Label>
            <Label>
              Icon
              <Input type="file" name="site-icon" />
              <HelperText>The icon at the top of the sidebar</HelperText>
            </Label>
            <Button className="bg-success">Update Settings</Button>
          </form>
        </div>
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
            onClick={async () => {
              await fetch('/api/backup')
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
