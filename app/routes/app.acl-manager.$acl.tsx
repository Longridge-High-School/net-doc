import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  ActionFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach, indexedBy} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Checkbox, Select} from '~/lib/components/input'
import {Button} from '~/lib/components/button'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'acl-manager:edit', {
    aclId: params.acl
  })

  const prisma = getPrisma()

  const acl = await prisma.aCL.findFirstOrThrow({
    where: {id: params.acl},
    include: {entries: true}
  })

  const users = await prisma.user.findMany({
    orderBy: {name: 'desc'},
    select: {id: true, name: true}
  })

  return json({user, acl, users})
}

export const action: ActionFunction = async ({request, params}) => {
  const user = await ensureUser(request, 'acl-manager:edit', {
    aclId: params.acl
  })

  const prisma = getPrisma()

  const formData = await request.formData()

  const aclEntries = await prisma.aCLEntry.findMany({
    where: {aclId: params.acl}
  })

  asyncForEach(aclEntries, async ({id}) => {
    const read = formData.get(`${id}-read`) === 'on'
    const write = formData.get(`${id}-write`) === 'on'
    const del = formData.get(`${id}-delete`) === 'on'

    await prisma.aCLEntry.update({
      where: {id},
      data: {read, write, delete: del}
    })
  })

  const newEntry = formData.get('new-entry') as string | undefined

  if (newEntry && newEntry !== 'no') {
    const {target, type} = JSON.parse(newEntry) as {
      target: string
      type: string
    }

    await prisma.aCLEntry.create({
      data: {
        aclId: params.acl!,
        target,
        type,
        read: false,
        write: false,
        delete: false
      }
    })
  }

  return redirect(`/app/acl-manager/${params.acl}`)
}

export const meta: MetaFunction = () => {
  return [
    {
      title: pageTitle('ACL Manager')
    }
  ]
}

export const ACLEditor = () => {
  const {acl, users} = useLoaderData<typeof loader>()

  const userIndex = indexedBy('id', users)

  const options = [
    {label: 'role/admin', type: 'role', target: 'admin'},
    {label: 'role/reader', type: 'role', target: 'reader'},
    {label: 'role/writer', type: 'role', target: 'writer'},
    ...users.map(({id, name}) => {
      return {label: `user/${name}`, type: 'user', target: id}
    })
  ]

  const skipOptions: string[] = []

  return (
    <div className="entry">
      <h2>{acl.name}</h2>
      <form method="POST">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Read</th>
              <th>Write</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {acl.entries.map(({id, type, target, read, write, delete: del}) => {
              const label = `${type}/${type === 'role' ? target : userIndex[target].name}`

              skipOptions.push(label)

              return (
                <tr key={id}>
                  <td>{label}</td>
                  <td>
                    <Checkbox defaultChecked={read} name={`${id}-read`} />
                  </td>
                  <td>
                    <Checkbox defaultChecked={write} name={`${id}-write`} />
                  </td>
                  <td>
                    <Checkbox defaultChecked={del} name={`${id}-delete`} />
                  </td>
                </tr>
              )
            })}
            <tr>
              <td>Add New Entry</td>
              <td colSpan={3}>
                <Select name="new-entry" defaultValue="no">
                  <option value="no">Add New Entry</option>
                  {options.map(({label, target, type}, i) => {
                    if (skipOptions.includes(label)) return

                    return (
                      <option value={JSON.stringify({target, type})} key={i}>
                        {label}
                      </option>
                    )
                  })}
                </Select>
              </td>
            </tr>
          </tbody>
        </table>
        <Button type="submit" className="bg-success">
          Update ACL
        </Button>
      </form>
    </div>
  )
}

export default ACLEditor
