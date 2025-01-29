import {omit} from '@arcath/utils'

export const inputClasses =
  'w-full border border-gray-300 rounded-sm p-2 mt-2 mb-4 shadow-sm invalid:border-pink-300'

export const Input = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  const className = `${inputClasses} ${props.className}`

  return <input {...omit(props, ['className'])} className={className} />
}

export const Checkbox = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  const className = `w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${props.className}`

  return (
    <div className="mt-2 mb-4">
      <input
        {...omit(props, ['className'])}
        type="checkbox"
        className={className}
      />
    </div>
  )
}

export const Label = (
  props: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  >
) => {
  const className = `mt-2 ${props.className}`

  return <label {...omit(props, ['className'])} className={className} />
}

export const HelperText: React.FC<{children: string}> = ({children}) => {
  return <p className="text-gray-300 font-thin text-sm mb-4">{children}</p>
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
