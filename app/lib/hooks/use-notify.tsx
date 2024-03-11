import React, {createContext, useContext, useReducer} from 'react'
import {v4 as uuidv4} from 'uuid'

export interface BaseNotification {
  title: string
  message: string
  type: 'success' | 'info' | 'danger' | 'warning'
}

export interface Notification extends BaseNotification {
  uuid: string
}

interface ReducerAction<T, K> {
  type: T
  payload: K
}

type NotificationActions =
  | ReducerAction<'add', BaseNotification>
  | ReducerAction<'remove', string>

const initialState: Notification[] = []

const NotificationsStateContext = createContext(initialState)
const NotificationsDispatchContext = createContext<
  React.Dispatch<NotificationActions> | undefined
>(undefined)

const notificationReducer = (
  state: Notification[],
  action: NotificationActions
) => {
  let newState = ([] as Notification[]).concat(state)

  switch (action.type) {
    case 'add':
      let notification = Object.assign({uuid: uuidv4()}, action.payload)

      newState.push(notification)
      return newState
    case 'remove':
      return newState.filter(notification => {
        return notification.uuid !== action.payload
      })
  }
}

export const Notifications: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const [state, dispatch] = useReducer(notificationReducer, [])

  return (
    <NotificationsStateContext.Provider value={state}>
      <NotificationsDispatchContext.Provider value={dispatch}>
        {children}
      </NotificationsDispatchContext.Provider>
    </NotificationsStateContext.Provider>
  )
}

export type UseNotificationsFunction<T extends Notification = Notification> =
  () => {
    notifications: T[]
    removeNotification: (uuid: string) => void
  }

export const useNotifications: UseNotificationsFunction = () => {
  const state = useContext(NotificationsStateContext)
  const dispatch = useContext(NotificationsDispatchContext)

  if (!dispatch) {
    throw new Error(
      'useNotifications can only be called within <Notifications>'
    )
  }

  const removeNotification = (uuid: string) => {
    dispatch({type: 'remove', payload: uuid})
  }

  return {notifications: state, removeNotification}
}

export type UseNotifyFunction<T extends BaseNotification = BaseNotification> =
  () => {
    notify: (notification: T) => void
  }

export const useNotify: UseNotifyFunction = () => {
  const dispatch = useContext(NotificationsDispatchContext)

  if (!dispatch) {
    throw new Error(
      'useNotifications can only be called within <Notifications>'
    )
  }

  const notify = (notification: BaseNotification) => {
    dispatch({type: 'add', payload: notification})
  }

  return {notify}
}
