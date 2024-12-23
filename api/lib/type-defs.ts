import {getPrisma} from '~/lib/prisma.server'

export const generateTypeDefs = async () => {
  const prisma = getPrisma()

  const assets = await prisma.asset.findMany({
    include: {assetFields: {include: {field: true}}}
  })

  let typeDefs = `
    type Query {
      getVersion: String
    }
  `

  assets.forEach(asset => {
    const gqlName = asset.singular.replace(/ /g, '').replace(/[^\w\s]+/g, '')

    typeDefs += `
      type ${gqlName} {
      _name: String
      ${asset.assetFields
        .map(assetField => {
          return `${assetField.field.name
            .split(' ')
            .map(s => {
              return s
                .toLowerCase()
                .replace(/[^\w\s]+/, '')
                .replace('(', '')
                .replace(')', '')
            })
            .join('')}: String`
        })
        .join(`\n`)}
      }
    `
  })

  return typeDefs
}
