import {type DashboardBoxFn, DashboardBox} from './boxes'

import {getPrisma} from '../prisma.server'

export type StatsData = {
  fields: number
  assets: number
  entries: number
  values: number
  documents: number
  passwords: number
}

export const statsBox: DashboardBoxFn<StatsData> = {
  render: ({fields, assets, entries, values, documents, passwords}) => {
    return (
      <DashboardBox title="Stats">
        <div className="grid grid-cols-3 gap-2 text-center mt-2">
          <div>
            <span className="text-xl">{fields.toLocaleString()}</span>
            <br />
            <span className="font-light">Fields</span>
          </div>
          <div>
            <span className="text-xl">{assets.toLocaleString()}</span>
            <br />
            <span className="font-light">Assets</span>
          </div>
          <div>
            <span className="text-xl">{entries.toLocaleString()}</span>
            <br />
            <span className="font-light">Entries</span>
          </div>
          <div>
            <span className="text-xl">{values.toLocaleString()}</span>
            <br />
            <span className="font-light">Values</span>
          </div>
          <div>
            <span className="text-xl">{documents.toLocaleString()}</span>
            <br />
            <span className="font-light">Documents</span>
          </div>
          <div>
            <span className="text-xl">{passwords.toLocaleString()}</span>
            <br />
            <span className="font-light">Passwords</span>
          </div>
        </div>
      </DashboardBox>
    )
  },
  metaComponent: (meta, id) => (
    <div>
      <i>Stats has no options</i>
      <input type="hidden" name={id} value="{}" />
      <input type="hidden" name={`${id}-type`} value="stats" />
    </div>
  )
}
