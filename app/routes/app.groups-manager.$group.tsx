import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {Label, Input, Select} from '~/lib/components/input'
import {hashPassword} from '~/lib/user.server'
import {pageTitle} from '~/lib/utils/page-title'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const currentUser = await ensureUser(request, 'group-manager:edit', {
    userId: params.user
  })

  const prisma = getPrisma()

  const group = await prisma.group.findFirstOrThrow({
    where: {id: params.group},
    include: {
      users: {include: {user: {select: {id: true, name: true, groups: true}}}}
    }
  })

  const users = await prisma.user.findMany({
    select: {id: true, name: true},
    orderBy: {name: 'desc'}
  })

  return {currentUser, group, users}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'group-manager:edit', {
    groupId: params.group
  })

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const group = await prisma.group.update({
    where: {id: params.group},
    data: {name}
  })

  return redirect(`/app/groups-manager/${group.id}`)
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [{title: pageTitle(matches, 'Group Manager', data!.group.name)}]
}

const GroupManagerGroup = () => {
  const {group, users} = useLoaderData<typeof loader>()

  const groupMemberIds = group.users.map(({user}) => user.id)

  const addableUsers = users.filter(({id}) => {
    return !groupMemberIds.includes(id)
  })

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="entry">
          <h4 className="text-xl">{group.name}</h4>
          <form method="POST">
            <Label>
              Name
              <Input name="name" defaultValue={group.name} />
            </Label>
            <Button className="bg-success">Update Group</Button>
          </form>
        </div>
      </div>
      <div>
        <form
          action={`/app/groups-manager/${group.id}/add-member`}
          method="POST"
        >
          <table className="entry-table">
            <thead>
              <tr>
                <th>User</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {group.users.map(({id, user}) => {
                return (
                  <tr key={id}>
                    <td>{user.name}</td>
                    <td>
                      {user.groups.length > 1 ? (
                        <Link
                          to={`/app/groups-manager/${group.id}/remove-user/${user.id}`}
                        >
                          🗑️
                        </Link>
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                )
              })}
              {addableUsers.length === 0 ? (
                ''
              ) : (
                <tr>
                  <td>
                    <Select name="userId">
                      {addableUsers.map(({id, name}) => {
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        )
                      })}
                    </Select>
                  </td>
                  <td>
                    <Button className="bg-success">Add User</Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  )
}

export default GroupManagerGroup
