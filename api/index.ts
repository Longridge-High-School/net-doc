import {ApolloServer} from '@apollo/server'
import {startStandaloneServer} from '@apollo/server/standalone'

import {generateTypeDefs} from './lib/type-defs'

const typeDefs = await generateTypeDefs()

const resolvers = {
  Query: {
    getVersion: () => '1.0.0'
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const {url} = await startStandaloneServer(server, {
  listen: {port: 4000}
})

console.log(`🚀  Server ready at: ${url}`)
