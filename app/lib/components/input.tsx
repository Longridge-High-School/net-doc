/* eslint-disable react/prop-types */

import {omit} from '@arcath/utils'

export const inputClasses =
  'w-full border border-gray-300 rounded p-2 mt-2 mb-4 shadow'

export const Input = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  const className = `${inputClasses} ${props.className}`

  return <input {...omit(props, ['className'])} className={className} />
}

export const Label = (
  props: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >
) => {
  const className = `mt-2 ${props.className}`

  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label {...omit(props, ['className'])} className={className} />
}

export const HelperText: React.FC<{children: string}> = ({children}) => {
  return <p className="text-grey-300 font-thin text-sm mb-4">{children}</p>
}

export const Select = (
  props: React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >
) => {
  const className = `${inputClasses} ${props.className}`

  return <select {...omit(props, ['className'])} className={className} />
}

export const TextArea = (
  props: React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) => {
  const className = `${inputClasses} ${props.className}`

  return <textarea {...omit(props, ['className'])} className={className} />
}
