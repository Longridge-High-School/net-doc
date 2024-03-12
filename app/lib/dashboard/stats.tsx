import {type DashboardBoxFn, DashboardBox} from './boxes'

import {getPrisma} from '../prisma.server'

export const statsBox: DashboardBoxFn<{
  fields: number
  assets: number
  entries: number
  values: number
  documents: number
  passwords: number
}> = {
  loader: async () => {
    const prisma = getPrisma()

    const counts = await prisma.$queryRaw<
      Array<{
        fields: bigint
        assets: bigint
        entries: bigint
        values: bigint
        documents: bigint
        passwords: bigint
      }>
    >`SELECT (SELECT count(*) FROM Field) as fields, (SELECT count(*) FROM Asset) as assets, (SELECT count(*) FROM Entry) as entries, (SELECT count(*) FROM Value) as "values", (SELECT count(*) from Document) as documents, (SELECT count(*) FROM Password) as passwords`

    // Prisma returns counts as BigInts which the JSON serialiser doesn't work with.
    return {
      fields: parseInt(counts[0].fields.toString()),
      assets: parseInt(counts[0].assets.toString()),
      entries: parseInt(counts[0].entries.toString()),
      values: parseInt(counts[0].values.toString()),
      documents: parseInt(counts[0].documents.toString()),
      passwords: parseInt(counts[0].passwords.toString())
    }
  },
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
