import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'

import {type DashboardBoxFn, DashboardBox} from './boxes'

import {formatAsDate} from '../utils/format'
import {Label, Select, HelperText, Input} from '~/lib/components/input'

export type ApproachingDatesData = Array<{
  id: string
  value: string
  slug: string
  name: string
  icon: string
}>

const MetaComponent: DashboardBoxFn<ApproachingDatesData>['metaComponent'] = (
  meta,
  id
) => {
  const [metaData, setMetaData] = useState(
    JSON.parse(meta === '' ? '{"fieldId": "", "title": ""}' : meta)
  )
  const {isPending, error, data} = useQuery<
    Array<{id: string; name: string; type: string}>
  >({
    queryKey: ['field-list'],
    queryFn: async () => {
      const response = await fetch('/api/fields')

      const json = await response.json()

      return json.fields
    }
  })

  if (isPending) {
    return <Label>Loading...</Label>
  }

  if (error) {
    return <Label>Error!</Label>
  }

  return (
    <div>
      <Label>
        Title
        <Input
          defaultValue={metaData.title}
          onChange={e => {
            setMetaData({title: e.target.value, fieldId: metaData.fieldId})
          }}
        />
        <HelperText>The title for the box.</HelperText>
      </Label>
      <Label>
        Date Field
        <Select
          defaultValue={metaData.fieldId}
          onChange={e => {
            setMetaData({title: metaData.title, fieldId: e.target.value})
          }}
        >
          <option value="">Choose a date field</option>
          {data
            .filter(({type}) => type === 'date')
            .map((asset, i) => {
              return (
                <option key={i} value={asset.id}>
                  {asset.name}
                </option>
              )
            })}
        </Select>
      </Label>
      <input type="hidden" name={id} value={JSON.stringify(metaData)} />

      <input type="hidden" name={`${id}-type`} value="approachingDates" />
    </div>
  )
}

export const approachingDatesBox: DashboardBoxFn<ApproachingDatesData> = {
  render: (values, meta) => {
    const {title} = JSON.parse(meta)

    return (
      <DashboardBox title={title}>
        {values.map(({id, slug, name, icon, value}) => {
          return (
            <a key={id} className="mt-2 block" href={`/app/${slug}/${id}`}>
              {icon} {name}
              <br />
              <span className="text-sm text-gray-400">
                {formatAsDate(value)}
              </span>
            </a>
          )
        })}
      </DashboardBox>
    )
  },
  metaComponent: MetaComponent
}
