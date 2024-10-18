import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  json
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {asyncForEach, asyncMap} from '@arcath/utils'
import {useState, useEffect, useReducer} from 'react'
import Papa from 'papaparse'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {Button} from '~/lib/components/button'
import {pageTitle} from '~/lib/utils/page-title'
import {Input, Select} from '~/lib/components/input'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'asset:view', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  return json({user, asset})
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const user = await ensureUser(request, 'asset:write', {
    assetSlug: params.assetslug
  })

  const prisma = getPrisma()

  const asset = await prisma.asset.findFirstOrThrow({
    where: {slug: params.assetslug},
    include: {assetFields: {include: {field: true}, orderBy: {order: 'asc'}}}
  })

  const reader = request.body?.getReader()

  const data = await reader?.read()

  const {record, columnMappings} = JSON.parse(data!.value!.toString()) as {
    record: string[]
    columnMappings: string[]
  }

  const entry = await prisma.entry.create({
    data: {assetId: asset.id, aclId: asset.aclId}
  })

  await asyncMap(
    record,
    async (value, i): Promise<{error: string; field: string} | boolean> => {
      if (!columnMappings[i]) {
        return false
      }

      await prisma.value.create({
        data: {
          entryId: entry.id,
          fieldId: columnMappings[i],
          value,
          lastEditedById: user.id
        }
      })

      return true
    }
  )

  return json({status: 200})
}

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {
      title: pageTitle(data!.asset.singular, 'Import')
    }
  ]
}

const AssetImport = () => {
  const [stage, setStage] = useState(1)
  const [csvFile, setCsvFile] = useState<undefined | File>(undefined)
  const [csvDetails, setCsvDetails] = useState<
    Papa.ParseResult<string[]>['data']
  >([])
  const [columnMappings, setColumnMappings] = useState<string[]>([])
  const [importedCount, dispatchImportedCount] = useReducer(
    (state: {count: number}) => {
      const newState = {...state}

      newState.count += 1

      return newState
    },
    {count: 0}
  )
  const {asset} = useLoaderData<typeof loader>()

  useEffect(() => {
    if (stage === 3) {
      asyncForEach(csvDetails, async (v, i) => {
        if (i === 0) {
          return
        }

        if (v.length === 1 && v[0] === '') {
          return
        }

        await fetch(`/app/${asset.slug}/import`, {
          method: 'POST',
          body: JSON.stringify({record: v, columnMappings})
        })

        dispatchImportedCount()
      })
    }
  }, [stage, csvDetails])

  switch (stage) {
    default:
    case 1:
      return (
        <div className="grid grid-cols-4 gap-4">
          <div className="entry">
            <h2>CSV Importer</h2>
            <Input
              type="file"
              onChange={e => {
                setCsvFile(e.target.files![0])
              }}
            />
            <Button
              className="bg-success"
              disabled={typeof csvFile === 'undefined'}
              onClick={() => {
                Papa.parse<string[]>(csvFile!, {
                  complete: results => {
                    setCsvDetails(results.data)
                    setStage(2)
                  }
                })
              }}
            >
              Import
            </Button>
          </div>
        </div>
      )
      break
    case 2:
      return (
        <div className="grid grid-cols-4 gap-4">
          <div className="entry">
            <h2>CSV Importer</h2>
            <p>Import file: {csvFile?.name}</p>
          </div>
          <div className="entry col-span-2">
            <h2>Column Matcher</h2>
            <table>
              <thead>
                <tr>
                  {csvDetails[0].map((v, i) => {
                    return <td key={i}>{v}</td>
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {csvDetails[0].map((v, i) => {
                    return (
                      <td key={i}>
                        <Select
                          onChange={e => {
                            columnMappings[i] = e.target.value
                            setColumnMappings([...columnMappings])
                          }}
                        >
                          <option value={-1}>Do not import</option>
                          {asset.assetFields.map(({field}) => {
                            return (
                              <option key={field.id} value={field.id}>
                                {field.name}
                              </option>
                            )
                          })}
                        </Select>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
            <Button
              className="bg-success"
              onClick={() => {
                setStage(3)
              }}
            >
              Import
            </Button>
          </div>
        </div>
      )
      break
    case 3:
      return (
        <div className="grid grid-cols-4 gap-4">
          <div className="entry">
            <h2>CSV Importer</h2>
            <p>Import file: {csvFile?.name}</p>
          </div>
          <div className="entry col-span-2">Importing...</div>
          <div className="entry">
            <h2>Imported</h2>
            {importedCount.count} /{' '}
            {csvDetails.filter(v => v.length !== 1 && v[0] !== '').length - 1}
          </div>
        </div>
      )
      break
  }
}

export default AssetImport
