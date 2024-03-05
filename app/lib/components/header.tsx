import {AButton} from './button'

export const Header = ({
  title,
  actions
}: {
  title: string
  actions?: Array<{link: string; label: string; className: string}>
}) => {
  return (
    <header className="border-b border-b-grey-100 pb-2 mb-4">
      <div className="flex gap-2 float-right">
        {actions?.map(({link, label, className}, i) => {
          return (
            <AButton key={i} href={link} className={className}>
              {label}
            </AButton>
          )
        })}
      </div>
      <h2 className="text-3xl mb-2 font-thin">{title}</h2>
    </header>
  )
}
