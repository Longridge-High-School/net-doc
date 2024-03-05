import bcrypt from 'bcrypt'
import {generateTOTP, getTOTPAuthUri, verifyTOTP} from '@epic-web/totp'

const SALT_ROUNDS = 10

export const hashPassword = async (password: string) => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS)

  return hashed
}

export const checkPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}
