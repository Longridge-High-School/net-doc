import {
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler
} from '@remix-run/node'
import {v4 as uuidv4} from 'uuid'
import {extname} from 'path'

export const getUploadHandler = () => {
  return unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      directory: 'public/uploads/',
      file: ({filename}) => {
        return `${uuidv4()}${extname(filename)}`
      }
    }),
    unstable_createMemoryUploadHandler()
  )
}
