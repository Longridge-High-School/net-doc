import {type MetaFunction} from '@remix-run/node'

import {Header} from '~/lib/components/header'
import {pageTitle} from '~/lib/utils/page-title'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('System')}]
}

const System = () => {
  return (
    <div>
      <Header title="System" />
      <div className="grid grid-cols-2 gap-8">
        <div className="entry">
          <h2>Backup</h2>

          <span className="text-red-600">
            This backup does not include password hash keys, please record them
            seperately.
          </span>
        </div>
      </div>
    </div>
  )
}

export default System
