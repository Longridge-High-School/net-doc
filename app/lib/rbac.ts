import {type canList} from './rbac.server'

export const canFromList = (
  index: string,
  cans: Awaited<ReturnType<typeof canList>>,
  notFound: boolean = false
) => {
  if (cans[index]) {
    return cans[index].result
  }

  return notFound
}
