import {useTimeoutFn} from 'react-use'
import {motion, AnimatePresence} from 'framer-motion'

import {type Notification, useNotifications} from '../hooks/use-notify'

export const Notificatons = () => {
  const {notifications, removeNotification} = useNotifications()

  return (
    <div className="fixed bottom-2 right-4 w-96">
      <AnimatePresence>
        {notifications.map(notification => {
          return (
            <NotificationBox
              notification={notification}
              key={notification.uuid}
              removeNotification={removeNotification}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

const NotificationBox = ({
  notification,
  removeNotification
}: {
  notification: Notification
  removeNotification: (uuid: string) => void
}) => {
  const [, cancel, reset] = useTimeoutFn(() => {
    removeNotification(notification.uuid)
  }, 5000)

  const bgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success'
      case 'warning':
        return 'bg-warning'
      case 'danger':
        return 'bg-danger'
      case 'info':
      default:
        return 'bg-info'
    }
  }

  return (
    <motion.div
      className={`rounded shadow-xl p-2 mb-2 ${bgColor(notification.type)}`}
      onMouseEnter={() => cancel()}
      onMouseLeave={() => reset()}
      layout
      layoutId={'notifications'}
      animate={{opacity: 1}}
      initial={{opacity: 0}}
      transition={{duration: 0.2}}
      exit={{opacity: 0}}
    >
      <button
        className="float-right"
        onClick={() => {
          removeNotification(notification.uuid)
        }}
      >
        ❌
      </button>
      <h4>{notification.title}</h4>
      <p>{notification.message}</p>
    </motion.div>
  )
}
