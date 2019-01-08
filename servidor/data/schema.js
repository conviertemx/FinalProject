// import {resolvers} from './resolvers'
import {importSchema} from 'graphql-import'
// import {makeExecutableSchema} from 'graphql-tools'

const typeDefs = importSchema('data/schema.graphql')

// const schema = makeExecutableSchema({typeDefs,resolvers})
//ya no lo requerimos por haber instalado apollo

export {typeDefs}
