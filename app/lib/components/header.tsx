import {LinkButton, Button} from './button'
import {useNotify} from '../hooks/use-notify'
import {useCopyToClipboard} from '../hooks/use-copy-to-clipboard'

export const Header = ({
  title,
  actions
}: {
  title: string
  actions?: Array<{link: string; label: string; className: string}>
}) => {
  const {notify} = useNotify()
  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <header className="border-b border-b-grey-100 pb-2 mb-4">
      <div className="flex gap-2 float-right">
        {actions?.map(({link, label, className}, i) => {
          return (
            <LinkButton key={i} to={link} className={className}>
              {label}
            </LinkButton>
          )
        })}
        <Button
          className="bg-success"
          onClick={() => {
            copyToClipboard(window.location.href)
            notify({
              title: 'Copied',
              message: `Copied "${window.location.href}" to the clipboard.`,
              type: 'success'
            })
          }}
        >
          🔗
        </Button>
      </div>
      <h2 className="text-3xl mb-2 font-thin">{title}</h2>
    </header>
  )
}
