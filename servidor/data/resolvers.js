import mongoose from 'mongoose';
import { Clientes, Productos, Pedidos, Usuarios } from './models';
import { rejects } from 'assert';
import bcrypt from 'bcrypt';
const ObjectId = mongoose.Types.ObjectId;
// Esto es para tomar un ID para filtrar clientes por vendedor

//generar token
import dotenv from 'dotenv';
dotenv.load('./variables.env');

import jwt from 'jsonwebtoken';
const crearToken = (usuarioLogin, secreto, expiresIn) => {
	const { usuario } = usuarioLogin;
	return jwt.sign({ usuario }, secreto, { expiresIn });
};

//Aqui entra la parte de graphql tools
export const resolvers = {
	Query: {
		//root siempre se tiene que pasar, aunque no se use
		//porque el segundo parametro se necesita usar
		getClientes: (root, { limite, offset, vendedor }) => {
			let filtro;
			if (vendedor) {
				filtro = { vendedor: new ObjectId(vendedor) };
			}
			//se implementa offset para la paginación, puede tener cualquier nombre
			return Clientes.find(filtro).limit(limite).skip(offset);
			//skip es un metodo de mongoose. También se tiene que modificar el schemagraphql
			//para hacer la paginación.
		},
		getCliente: (root, { id }) => {
			return new Promise((resolve, object) => {
				Clientes.findById(id, (error, cliente) => {
					if (error) ejects(error);
					else resolve(cliente);
				});
			});
		},
		totalClientes: (root, { vendedor }) => {
			return new Promise((resolve, object) => {
				let filtro;
				if (vendedor) {
					filtro = { vendedor: new ObjectId(vendedor) };
				}

				Clientes.countDocuments(filtro, (error, count) => {
					if (error) rejects(error);
					else resolve(count);
				});
			});
		},
		obtenerProductos: (root, { limite, offset, stock }) => {
			let filtro;
			if (stock) {
				filtro = { stock: { $gt: 0 } };
			}
			return Productos.find(filtro).limit(limite).skip(offset);
		},
		obtenerProducto: (root, { id }) => {
			return new Promise((resolve, object) => {
				Productos.findById(id, (error, producto) => {
					//producto es el object
					if (error) rejects(error);
					else resolve(producto);
				});
			});
		},
		totalProductos: (root) => {
			return new Promise((resolve, object) => {
				Productos.countDocuments({}, (error, count) => {
					if (error) rejects(error);
					else resolve(count);
				});
			});
		},
		obtenerPedidos: (root, { cliente }) => {
			return new Promise((resolve, object) => {
				Pedidos.find({ cliente: cliente }, (error, pedido) => {
					if (error) rejects(error);
					else resolve(pedido);
				});
				//cliente es el campo que se quiere filtrar, y cliente es el que queremos buscar
			});
		},
		topClientes: (root) => {
			return new Promise((resolve, object) => {
				Pedidos.aggregate(
					[
						{
							$match: { estado: 'COMPLETADO' }
						},
						{
							$group: {
								_id: '$cliente',
								total: { $sum: '$total' }
							}
						},
						{
							$lookup: {
								from: 'clientes',
								localField: '_id',
								foreignField: '_id',
								as: 'cliente'
							}
						},
						{
							$sort: { total: -1 }
						},
						{
							$limit: 10
						}
					],
					(error, resultado) => {
						if (error) rejects(error);
						else resolve(resultado);
					}
				);
			});
		},

		obtenerUsuario: (root, args, { usuarioActual }) => {
			//usuarioActual tiene que ser el mismo que el de index.js
			if (!usuarioActual) {
				return null;
			}
			console.log(usuarioActual);
			//obtener el usuario actual del request del JWT Verificado
			const usuario = Usuarios.findOne({ usuario: usuarioActual.usuario });
			return usuario;
		},

		topVendedores: (root) => {
			return new Promise((resolve, object) => {
				Pedidos.aggregate(
					[
						{
							$match: { estado: 'COMPLETADO' }
						},
						{
							$group: {
								_id: '$vendedor',
								total: { $sum: '$total' }
							}
						},
						{
							$lookup: {
								from: 'usuarios',
								localField: '_id',
								foreignField: '_id',
								as: 'vendedor'
							}
						},
						{
							$sort: { total: -1 }
						},
						{
							$limit: 10
						}
					],
					(error, resultado) => {
						if (error) rejects(error);
						else resolve(resultado);
					}
				);
			});
		}
		// 	topProductos: (root) => {
		// 		return new Promise((resolve, object) => {
		// 			Pedidos.aggregate(
		// 				[
		// 					{
		// 						$match: { estado: 'COMPLETADO' }
		// 					},
		// 					{
		// 						$group: {
		// 							_id: '$vendedor',
		// 							total: { $sum: '$total' }
		// 						}
		// 					},
		// 					{
		// 						$lookup: {
		// 							from: 'usuarios',
		// 							localField: '_id',
		// 							foreignField: '_id',
		// 							as: 'vendedor'
		// 						}
		// 					},
		// 					{
		// 						$sort: { total: -1 }
		// 					},
		// 					{
		// 						$limit: 10
		// 					}
		// 				],
		// 				(error, resultado) => {
		// 					if (error) rejects(error);
		// 					else resolve(resultado);
		// 				}
		// 			);
		// 		});
		// 	}
	},
	Mutation: {
		crearCliente: (root, { input }) => {
			const nuevoCliente = new Clientes({
				nombre: input.nombre,
				apellido: input.apellido,
				empresa: input.empresa,
				emails: input.emails,
				edad: input.edad,
				tipo: input.tipo,
				pedidos: input.pedidos,
				vendedor: input.vendedor
			});
			nuevoCliente.id = nuevoCliente._id;

			return new Promise((resolve, object) => {
				nuevoCliente.save((error) => {
					if (error) rejects(error);
					else resolve(nuevoCliente);
				});
			});
		},
		actualizarCliente: (root, { input }) => {
			return new Promise((resolve, object) => {
				Clientes.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error, cliente) => {
					if (error) rejects(error);
					else resolve(cliente);
				});
			});
		},
		eliminarCliente: (root, { id }) => {
			return new Promise((resolve, object) => {
				Clientes.findOneAndDelete({ _id: id }, (error) => {
					if (error) rejects(error);
					else resolve(`se elimino cliente con ${id} correctamente`);
				});
			});
		},
		nuevoProducto: (root, { input }) => {
			const nuevoProducto = new Productos({
				nombre: input.nombre,
				precio: input.precio,
				stock: input.stock
			});
			//mongo db crea el ID que se asigna al objeto
			nuevoProducto.id = nuevoProducto._id;
			return new Promise((resolve, object) => {
				nuevoProducto.save((error) => {
					//.save es un metodo de mongoose
					if (error) rejects(error);
					else resolve(nuevoProducto);
				});
			});
		},
		actualizarProducto: (root, { input }) => {
			return new Promise((resolve, producto) => {
				Productos.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error, producto) => {
					//le pasamos el id a actualizar, lo actualizamos con el input, y si no existe el id crear uno nuevo {new:true}
					if (error) rejects(error);
					else resolve(producto);
				});
			});
		},
		eliminarProducto: (root, { id }) => {
			return new Promise((resolve, producto) => {
				Productos.findOneAndDelete({ _id: id }, (error) => {
					if (error) rejects(error);
					else resolve('se eliminó correctamente');
				});
			});
		},
		nuevoPedido: (root, { input }) => {
			const nuevoPedido = new Pedidos({
				pedido: input.pedido,
				total: input.total,
				fecha: new Date(),
				cliente: input.cliente,
				estado: 'PENDIENTE',
				vendedor: input.vendedor
			});
			nuevoPedido.id = nuevoPedido._id;

			return new Promise((resolve, object) => {
				nuevoPedido.save((error) => {
					if (error) rejects(error);
					else resolve(nuevoPedido);
				});
			});
		},
		actualizarEstado: (root, { input }) => {
			return new Promise((resolve, object) => {
				//recorrer y actualizar la cantidad de productos en base al estado
				//del pedido

				console.log(input);
				const { estado } = input;
				let instruccion;
				if (estado === 'COMPLETADO') {
					instruccion = '-';
				} else if (estado === 'CANCELADO') {
					instruccion = '+';
				}

				input.pedido.forEach((pedido) => {
					Productos.updateOne(
						{ _id: pedido.id },
						{
							//$inc es una funcion de mongoDB
							$inc: { stock: `${instruccion}${pedido.cantidad}` }
						},
						function(error) {
							if (error) return new Error(error);
						}
					);
				});
				Pedidos.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error) => {
					if (error) rejects(error);
					else resolve('se actualizo correctamente');
				});
			});
		},
		crearUsuario: async (root, { usuario, nombre, password, rol }) => {
			//Revisar si un usuario contiene este password
			const existeUsuario = await Usuarios.findOne({ usuario }); //Si no tuviera ECMA seria {(usuario: usuario)}
			if (existeUsuario) {
				throw new Error('el usuario ya existe');
			}
			const nuevoUsuario = await new Usuarios({
				usuario,
				nombre,
				password,
				rol
			}).save();
			console.log(nuevoUsuario);
			return 'creado correctamente';
		},
		autenticarUsuario: async (root, { usuario, password }) => {
			const nombreUsuario = await Usuarios.findOne({ usuario });
			if (!nombreUsuario) {
				throw new Error('Usuario no encontrado');
			}
			const passwordCorrecto = await bcrypt.compare(password, nombreUsuario.password);
			//si el password es incorrecto
			if (!passwordCorrecto) {
				throw new Error('Password incorrecto');
			}
			return {
				token: crearToken(nombreUsuario, process.env.SECRETO, '1hr')
			};
		}
	}
};

//find one and update: parametros (filter, valor que va a actualizar, las opciones)
//New: true es si el registro con el id que le pasamos no existe, que cree uno nuevo
