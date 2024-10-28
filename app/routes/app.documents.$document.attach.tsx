import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  type ActionFunctionArgs,
  redirect,
  unstable_parseMultipartFormData
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {basename} from 'path'
import {invariant} from '@arcath/utils'

import {ensureUser} from '~/lib/utils/ensure-user'
import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils/page-title'
import {Input} from '~/lib/components/input'
import {Button, AButton} from '~/lib/components/button'
import {
  getUploadMetaData,
  getUploadHandler
} from '~/lib/utils/upload-handler.server'

export type Attachment = {
  uri: string
  originalFileName: string
  type: string
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await ensureUser(request, 'document:write', {
    documentId: params.document
  })

  const prisma = getPrisma()

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document}
  })

  const attachments = (
    JSON.parse(document.attachments) as Array<Attachment>
  ).filter(v => v !== null)

  const {searchParams} = new URL(request.url)
  const del = searchParams.get('delete')

  if (del) {
    delete attachments[parseInt(del)]

    await prisma.document.update({
      where: {id: params.document},
      data: {attachments: JSON.stringify(attachments)}
    })
  }

  return json({
    user,
    document,
    attachments: attachments.filter(v => v !== null)
  })
}

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  return [
    {title: pageTitle(matches, 'Document', data!.document.title, 'Attachments')}
  ]
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  await ensureUser(request, 'document:write', {
    documentId: params.document
  })

  const prisma = getPrisma()

  const document = await prisma.document.findFirstOrThrow({
    where: {id: params.document}
  })

  const uploadHandler = getUploadHandler()

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const file = formData.get('file') as unknown as
    | {filepath: string; type: string}
    | undefined

  invariant(file)

  const fileName = basename(file.filepath)

  const metaData = getUploadMetaData(fileName)

  const newAttachment: Attachment = {
    uri: `/uploads/${fileName}`,
    originalFileName: metaData ? metaData.originalFileName : fileName,
    type: file.type
  }

  const attachments = JSON.parse(document.attachments) as Array<Attachment>

  attachments.push(newAttachment)

  await prisma.document.update({
    where: {id: params.document},
    data: {attachments: JSON.stringify(attachments)}
  })

  return redirect(`/app/documents/${document.id}`)
}

const AttachToDocumentPage = () => {
  const {attachments} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="entry col-span-3">
        <h2>Attachments</h2>
        <form method="POST" encType="multipart/form-data">
          <table>
            <thead>
              <tr>
                <th>URI</th>
                <th>File Name</th>
                <th>File Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attachments.map(({uri, originalFileName, type}, i) => {
                return (
                  <tr key={uri}>
                    <td>{uri}</td>
                    <td>{originalFileName}</td>
                    <td>{type}</td>
                    <td>
                      <AButton href={`?delete=${i}`}>🗑️</AButton>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <td colSpan={2}>
                <Input type="file" name="file" />
              </td>
              <td colSpan={2}>
                <Button className="bg-success">Upload</Button>
              </td>
            </tfoot>
          </table>
        </form>
      </div>
    </div>
  )
}

export default AttachToDocumentPage
