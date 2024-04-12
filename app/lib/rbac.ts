import {canCant} from 'cancant'

export const {can} = canCant<'guest' | 'user' | 'manager' | 'admin'>({
  guest: {
    can: ['login']
  },
  user: {
    can: [
      'logout',
      'app',
      'dashboard',
      'search',
      'user:self',
      {
        name: 'user:*',
        when: async ({user, targetId}) => {
          return user.id === targetId
        }
      }
    ]
  },
  manager: {
    inherits: ['user'],
    can: ['logout']
  },
  admin: {
    can: [
      'app',
      'asset:*',
      'entry:*',
      'asset-manager:*',
      'field-manager:*',
      'user-manager:*',
      'dashboard',
      'search',
      'logout',
      'document:*',
      'password:*',
      'user:*',
      'dashboard:*',
      'process:*'
    ]
  }
}) as {
  can: (
    role: string,
    operation: string | string[],
    params?: object
  ) => Promise<boolean>
}
