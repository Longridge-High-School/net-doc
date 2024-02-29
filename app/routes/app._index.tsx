import {type LoaderFunctionArgs, json} from '@remix-run/node'

import {ensureUser} from '~/lib/utils/ensure-user'
import {Header} from '~/lib/components/header'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'dashboard', {
    assetSlug: params.assetslug
  })

  return json({user})
}

const Dashboard = () => {
  return (
    <div>
      <Header title="Dashboard" />
    </div>
  )
}

export default Dashboard
