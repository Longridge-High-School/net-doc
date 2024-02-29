export const Header = ({title}: {title: string}) => {
  return (
    <header className="border-b border-b-grey-100 pb-2 mb-4">
      <h2 className="text-3xl font-thin">{title}</h2>
    </header>
  )
}
