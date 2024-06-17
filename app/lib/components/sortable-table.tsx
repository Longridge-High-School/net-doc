import {type Asset, type AssetField, type Field} from '@prisma/client'
import {type IndexedArray} from '@arcath/utils'
import {Link} from '@remix-run/react'

import {FIELDS} from '../fields/field'

import {useSortableData} from '../hooks/use-sortable-data'

export const SortableTable = ({
  asset,
  entries,
  values
}: {
  asset: Asset & {assetFields: Array<AssetField & {field: Field}>}
  entries: Array<{id: string; name: string}>
  values: IndexedArray<{
    id: string
    value: string
    type: string
    lookup: string
  }>
}) => {
  const {data, sort, sortOrder, sortedBy} = useSortableData({
    asset,
    entries,
    values,
    sortedBy: asset.nameFieldId,
    sortOrder: 'ASC'
  })

  return (
    <table className="entry-table">
      <thead>
        <tr>
          <th>
            {asset.singular}
            <button
              onClick={() => {
                sort(
                  sortedBy === asset.nameFieldId && sortOrder === 'ASC'
                    ? 'DESC'
                    : 'ASC',
                  asset.nameFieldId
                )
              }}
            >
              {sortedBy === asset.nameFieldId && sortOrder === 'ASC'
                ? '🔽'
                : '🔼'}
            </button>
          </th>
          {asset.assetFields
            .filter(({displayOnTable}) => displayOnTable)
            .map(({id, field}) => {
              return (
                <th key={id}>
                  {field.name}{' '}
                  <button
                    onClick={() => {
                      sort(
                        sortedBy === field.id && sortOrder === 'ASC'
                          ? 'DESC'
                          : 'ASC',
                        field.id
                      )
                    }}
                  >
                    {sortedBy === field.id && sortOrder === 'ASC' ? '🔽' : '🔼'}
                  </button>
                </th>
              )
            })}
        </tr>
      </thead>
      <tbody>
        {data.map(({id, fields}) => {
          return (
            <tr key={id}>
              {asset.assetFields
                .filter(
                  ({displayOnTable, field}) =>
                    displayOnTable || field.id === asset.nameFieldId
                )
                .map(({fieldId, field}) => {
                  const value = fields[fieldId].value

                  const Value = () => {
                    if (fieldId === asset.nameFieldId) {
                      return (
                        <Link to={`/app/${asset.slug}/${id}`}>{value}</Link>
                      )
                    }

                    return FIELDS[field.type].listComponent({
                      value,
                      title: field.name,
                      meta: field.meta
                    })
                  }
                  return (
                    <td key={fieldId}>
                      <Value />
                    </td>
                  )
                })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
