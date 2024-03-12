import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler
} from '@remix-run/node'
import {v4 as uuidv4} from 'uuid'
import {extname} from 'path'

const uploadMetaData: {[fileName: string]: {originalFileName: string}} = {}

/**
 * Returns the in-memory upload meta data
 *
 * This is destructive and deletes the meta data as it retrieves.
 *
 * @param fileName
 * @returns
 */
export const getUploadMetaData = (
  fileName: string
): {originalFileName: string} | undefined => {
  const data = uploadMetaData[fileName]

  delete uploadMetaData[fileName]

  return data
}

export const getUploadHandler = () => {
  return unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      directory: 'public/uploads/',
      file: ({filename}) => {
        const newFileName = `${uuidv4()}${extname(filename)}`

        uploadMetaData[newFileName] = {originalFileName: filename}

        return newFileName
      }
    }),
    unstable_createMemoryUploadHandler()
  )
}
