import {createCookie} from '@remix-run/node'

export const session = createCookie('session', {
  maxAge: 604_800
})
