import {Outlet, useMatches, useRouteLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {Header} from '~/lib/components/header'
import {useNotify} from '~/lib/hooks/use-notify'

const Documents = () => {
  const matches = useMatches()
  const documentData = useRouteLoaderData<
    {document: {body: string}} | undefined
  >('routes/app.documents.$document._index')

  const {notify} = useNotify()

  const isProcess = !!(
    documentData && documentData.document.body.match(/- \[ \]/g)
  )

  const documentActions: Array<{
    link: string
    label: string
    className: string
  }> = []

  const actions = () => {
    const {id, params} = matches.pop()!

    invariant(id)
    invariant(params)

    switch (id) {
      case 'routes/app.documents._index':
        return [
          {
            link: '/app/documents/add',
            label: 'Add Document',
            className: 'bg-success'
          }
        ]
      case 'routes/app.documents.$document._index':
        if (isProcess) {
          documentActions.push({
            link: `/app/process/add/${params.document}`,
            label: 'Run Process',
            className: 'bg-warning'
          })
        }

        return [
          ...documentActions,
          {
            link: `/app/documents/${params.document}/edit`,
            label: 'Edit Document',
            className: 'bg-info'
          },
          {
            link: '#',
            label: '📌',
            className: 'bg-info',
            action: async () => {
              const response = await fetch('/api/pin', {
                method: 'POST',
                body: JSON.stringify({
                  target: 'documents',
                  targetId: params.document
                })
              })

              const {result} = await response.json()

              if (!result) {
                notify({
                  title: 'Error',
                  type: 'danger',
                  message: 'Unable to pin/unpin'
                })

                return
              }

              if (result === 'remove') {
                notify({
                  title: 'Pin Removed',
                  type: 'info',
                  message: 'Document un pinned.'
                })

                return
              }

              notify({
                title: 'Pin Added',
                type: 'success',
                message: 'Document pinned.'
              })
            }
          }
        ]
      default:
        return []
    }
  }

  return (
    <div>
      <Header title="Documents" actions={actions()} />
      <Outlet />
    </div>
  )
}

export default Documents
