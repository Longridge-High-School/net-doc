import {type DashboardBoxFn, DashboardBox} from './boxes'

import {formatAsDate} from '../utils/format'

export type IncompleteProcessesData = Array<{
  id: string
  title: string
  updatedAt: string
}>

export const incompleteProcessesBox: DashboardBoxFn<IncompleteProcessesData> = {
  render: processes => {
    return (
      <DashboardBox title="Incomplete Processes">
        {processes.map(({id, title, updatedAt}) => {
          return (
            <a key={id} className="mt-2 block" href={`/app/process/${id}`}>
              {title}
              <br />
              <span className="text-sm text-gray-400">
                {formatAsDate(updatedAt as unknown as string)}
              </span>
            </a>
          )
        })}
      </DashboardBox>
    )
  },
  metaComponent: (meta, id) => (
    <div>
      <i>Incomplete Processes has no options</i>
      <input type="hidden" name={id} value="{}" />
      <input type="hidden" name={`${id}-type`} value="incompleteProcesses" />
    </div>
  )
}
