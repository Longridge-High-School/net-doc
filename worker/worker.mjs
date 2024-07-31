import {Worker, Queue} from 'bullmq'
import path from 'path'
import {mkdirp} from 'mkdirp'
import {format} from 'date-fns'
import AdmZip from 'adm-zip'
import cron from 'node-cron'

import {getRedis} from '../app/lib/redis.server.mjs'

const connection = getRedis()

const queue = new Queue('main', {connection})

const handlers = {}

/**
 * Creates a typed handle using the types from the queues file in the remix app.
 *
 * @template {import('../app/lib/queues.server').JobName} JobName
 * @param {JobName} job
 * @param {import('bullmq').Processor<import('../app/lib/queues.server').Jobs[JobName]>} processor
 * @returns
 */
const createHandler = (job, processor) => {
  handlers[job] = processor
}

const worker = new Worker(
  'main',
  async ({name, data}) => {
    if (handlers[name]) {
      handlers[name]({data})
    } else {
      console.error('No handler')
    }
  },
  {connection}
)

cron.schedule('0 0 0 * * 7', async () => {
  // Run backups every sunday
  await queue.add('createBackup', {})
})

const BACKUPS_DIR = path.join(process.cwd(), 'public', 'backups')
const UPLOADS_PATH = path.join(process.cwd(), 'public', 'uploads')
const DB_PATH = path.join(
  process.cwd(),
  'prisma',
  process.env.DATABASE_URL.replace('file:.', '')
)

createHandler('createBackup', async () => {
  mkdirp(BACKUPS_DIR)

  const zip = new AdmZip()

  zip.addLocalFile(DB_PATH, 'database')
  await new Promise((resolve, reject) => {
    zip.addLocalFolderAsync(UPLOADS_PATH, (s, e) => resolve(), 'uploads')
  })

  const fileDate = format(new Date(), 'yyyy-MM-dd-HH-mm')

  await zip.writeZipPromise(path.join(BACKUPS_DIR, `backup-${fileDate}.zip`))
})

console.log('Ready for jobs')
