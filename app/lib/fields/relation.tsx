/* eslint-disable react/prop-types */
import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'

import {type Field} from './field'
import {Label, Input, HelperText, Select} from '../components/input'
import {useDebounce} from '../hooks/use-debounce'
import {indexedBy} from '@arcath/utils'

const EditComponent: Field['editComponent'] = ({
  value,
  name,
  label,
  helperText,
  meta
}) => {
  const [text, setText] = useState('')
  const search = useDebounce(text, 500)
  const {isPending, error, data} = useQuery<
    Array<{entryId: string; value: string}>
  >({
    queryKey: ['entries', meta],
    queryFn: async () => {
      const response = await fetch(`/api/${meta}/entries`)

      const {entries} = await response.json()

      console.dir(entries)

      return entries
    }
  })
  const [newValue, setNewValue] = useState(
    JSON.parse(value === '' || value === undefined ? '[]' : value)
  )

  if (isPending) {
    return <span>Loading</span>
  }
  if (error) {
    return <span>error</span>
  }

  const suggestions = data.filter(({value}) => {
    return value.toLowerCase().match(`${search.toLowerCase()}`)
  })

  const entries = indexedBy('entryId', data)

  return (
    <Label>
      {label}
      <Input
        onChange={e => {
          setText(e.target.value)
        }}
        value={text}
      />
      {search.length > 0
        ? suggestions.map(({entryId, value}) => {
            return (
              <button
                key={entryId}
                type="button"
                className="bg-gray-300 p-2 rounded m-2 hover:bg-gray-200"
                onClick={() => {
                  setNewValue([...newValue, entryId])
                  setText('')
                }}
              >
                {value}
              </button>
            )
          })
        : ''}
      <div className="flex gap-2">
        {newValue.map((entryId: string) => {
          return (
            <span key={entryId} className="bg-gray-300 p-2 rounded">
              {entries[entryId].value}{' '}
              <button
                type="button"
                onClick={() => {
                  const filtered = newValue.filter((fId: string) => {
                    return fId !== entryId
                  })

                  setNewValue([...filtered])
                }}
              >
                ❌
              </button>
            </span>
          )
        })}
      </div>
      <HelperText>{helperText}</HelperText>
      <input type="hidden" name={name} value={JSON.stringify(newValue)} />
    </Label>
  )
}

const ViewComponent: Field['viewComponent'] = ({value, title, meta}) => {
  const {isPending, error, data} = useQuery<{
    entries: Array<{entryId: string; value: string}>
    asset: {slug: string; icon: string}
  }>({
    queryKey: ['entries-with-asset', meta],
    queryFn: async () => {
      const response = await fetch(`/api/${meta}/entries`)

      const json = await response.json()

      return json
    }
  })

  if (isPending) {
    return (
      <p className="mb-4">
        <span className="mb-2 font-bold">{title}</span>
        Loading...
      </p>
    )
  }

  if (error) {
    return (
      <p className="mb-4">
        <span className="mb-2 font-bold">{title}</span>
        Could not load relation
      </p>
    )
  }

  const entries = indexedBy('entryId', data.entries)
  const selections = JSON.parse(value)

  return (
    <div className="mb-4">
      <h5 className="mb-2 font-bold">{title}</h5>
      <div className="flex gap-2">
        {selections.map((entryId: string) => {
          return (
            <a
              key={entryId}
              href={`/app/${data.asset.slug}/${entryId}`}
              className="bg-gray-300 p-2 rounded"
            >
              {data.asset.icon} {entries[entryId].value}
            </a>
          )
        })}
      </div>
    </div>
  )
}

const MetaComponent: Field['metaComponent'] = ({meta}) => {
  const {isPending, error, data} = useQuery<Array<{id: string; name: string}>>({
    queryKey: ['asset-list'],
    queryFn: async () => {
      const response = await fetch('/api/assets')

      const json = await response.json()

      return json.assets
    }
  })

  if (isPending) {
    return <Label>Loading...</Label>
  }

  if (error) {
    return <Label>Error!</Label>
  }

  return (
    <Label>
      Asset Relation
      <Select name="meta" defaultValue={meta}>
        {data.map((asset, i) => {
          return (
            <option key={i} value={asset.id}>
              {asset.name}
            </option>
          )
        })}
      </Select>
    </Label>
  )
}

const ListComponent: Field['listComponent'] = ({value, title, meta}) => {
  const {isPending, error, data} = useQuery<{
    entries: Array<{entryId: string; value: string}>
    asset: {slug: string; icon: string}
  }>({
    queryKey: ['entries-with-asset', meta],
    queryFn: async () => {
      const response = await fetch(`/api/${meta}/entries`)

      const json = await response.json()

      return json
    }
  })

  if (value === '') {
    return <i>None</i>
  }

  if (isPending) {
    return <>...</>
  }

  if (error) {
    return <>Could not fetch {title}</>
  }

  const entries = indexedBy('entryId', data.entries)
  const selections = JSON.parse(value)

  return (
    <div className="flex gap-2">
      {selections.map((entryId: string) => {
        return (
          <a
            key={entryId}
            href={`/app/${data.asset.slug}/${entryId}`}
            className="bg-gray-300 p-2 rounded"
          >
            {data.asset.icon} {entries[entryId].value}
          </a>
        )
      })}
    </div>
  )
}

export const relationField: Field = {
  editComponent: EditComponent,
  viewComponent: ViewComponent,
  metaComponent: MetaComponent,
  listComponent: ListComponent
}
