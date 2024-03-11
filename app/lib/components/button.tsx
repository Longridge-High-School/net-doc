import {type LinkProps, Link} from '@remix-run/react'
import {omit} from '@arcath/utils'

export const ButtonClasses = 'shadow rounded-lg p-2'

export const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  const className = `${ButtonClasses} ${props.className}`

  return <button {...omit(props, ['className'])} className={className} />
}

export const AButton = (
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
) => {
  const className = `${ButtonClasses} inline-block ${props.className}`

  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a {...omit(props, ['className'])} className={className} />
}

export const LinkButton = (props: LinkProps) => {
  const className = `${ButtonClasses} inline-block ${props.className}`

  return <Link {...omit(props, ['className'])} className={className} />
}
