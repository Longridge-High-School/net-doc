import {scrypt, randomBytes, createCipheriv, createDecipheriv} from 'crypto'

export const getCryptoSuite = async () => {
  const algorithm = 'aes-192-cbc'
  const key = await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      process.env.PASSWORD_KEY!,
      process.env.PASSWORD_SALT!,
      24,
      (error, derivedKey) => {
        if (error) {
          reject(error)
        }

        resolve(derivedKey)
      }
    )
  })

  const encrypt = (text: string) => {
    console.dir(randomBytes(8).toString('hex'))

    const cipher = createCipheriv(
      algorithm,
      key,
      Buffer.from(process.env.PASSWORD_IV!, 'utf8')
    )

    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
  }

  const decrypt = (hash: string) => {
    const decipher = createDecipheriv(
      algorithm,
      key,
      Buffer.from(process.env.PASSWORD_IV!, 'utf8')
    )
    return decipher.update(hash, 'hex', 'utf8') + decipher.final('utf8')
  }

  return {encrypt, decrypt}
}
