import {useReducer} from 'react'
import {type IndexedArray} from '@arcath/utils'

type SortableDataInput = {
  asset: {
    nameFieldId: string
    slug: string
    assetFields: Array<{
      id: string
      displayOnTable: boolean
      field: {id: string; name: string}
    }>
  }
  entries: Array<{id: string}>
  values: IndexedArray<{
    id: string
    lookup: string
    value: string
    type: string
  }>
  sortedBy: string
  sortOrder: 'ASC' | 'DESC'
}

type SortableActions =
  | {
      type: 'sort'
      data: {field: string; direction: 'ASC' | 'DESC'}
    }
  | {type: 'rebuild'; data: SortableDataInput}

const useSortableDataReducer = (
  state: ReturnType<typeof generateSortedData>,
  action: SortableActions
) => {
  const newState = {...state}

  switch (action.type) {
    case 'sort':
      return generateSortedData({
        asset: state.asset,
        entries: state.entries,
        values: state.values,
        sortOrder: action.data.direction,
        sortedBy: action.data.field
      })
    default:
      return newState
  }
}

const generateSortedData = ({
  asset,
  entries,
  values,
  sortOrder,
  sortedBy
}: SortableDataInput) => {
  const data = entries
    .map(({id}) => {
      const entryRow: {
        fields: {
          [fieldId: string]: {value: string; type: string; entryId: string}
        }
        id: string
      } = {id, fields: {}}

      asset.assetFields
        .filter(
          ({displayOnTable, field}) =>
            displayOnTable || field.id === asset.nameFieldId
        )
        .forEach(({field}) => {
          const lookup = `${id}/${field.id}`

          const {type, value} = values[lookup]
            ? values[lookup]
            : {value: '', type: 'text'}

          entryRow.fields[field.id] = {type, value, entryId: id}
        })

      return entryRow
    })
    .sort((a, b) => {
      return a.fields[sortedBy].value.localeCompare(b.fields[sortedBy].value)
    })

  return {
    data: sortOrder === 'DESC' ? data.reverse() : data,
    asset,
    entries,
    values,
    sortOrder,
    sortedBy
  }
}

export const useSortableData = ({
  asset,
  entries,
  values,
  sortOrder,
  sortedBy
}: SortableDataInput) => {
  const [state, dispatch] = useReducer(
    useSortableDataReducer,
    {asset, entries, values, sortOrder, sortedBy},
    generateSortedData
  )

  const sort = (direction: 'ASC' | 'DESC', field: string) =>
    dispatch({type: 'sort', data: {direction, field}})

  const rebuild = (data: SortableDataInput) => dispatch({type: 'rebuild', data})

  return {
    data: state.data,
    sortedBy: state.sortedBy,
    sortOrder: state.sortOrder,
    sort,
    rebuild
  }
}
