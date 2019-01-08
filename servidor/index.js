import express from 'express';
//graphql
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './data/schema';
import { resolvers } from './data/resolvers';
import jwt from 'jsonwebtoken';
require('dotenv').load();
//resolvers
// import resolvers from './data/resolvers'

// const root = resolvers
const app = express();
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		//context va a revisar en cada endpoint que el usuario esté autenticado
		//obtener el token del servidor
		const token = req.headers['authorization'];
		console.log(token);
		if (token !== 'null') {
			try {
				//Verificar el token del front end (cliente)
				const usuarioActual = await jwt.verify(token, process.env.SECRETO);
				// console.log(usuarioActual)
				// agregamos al usuario actual al request
				req.usuarioActual = usuarioActual;
				return {
					usuarioActual
				};
			} catch (err) {
				console.error(err);
			}
		}
	}
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => console.log(`el servidor esta corriendo ${server.graphqlPath}`));

// app.get('/',(req,res)=>{
//     res.send('todo listo')
// })

// app.use('/graphql',graphqlHTTP({
//     //que schema va a utilizar cuando estemos en el url
//     schema,
//     //utilizar graphical
//     graphiql: true
// }))

// app.listen(8000,()=> console.log('el servidor esta funcionando'))
