import mongoose from 'mongoose';
// import mongoose, {Schema} from 'mongoose'
// const usuariosSchema = new Schema
//otra manera de escribirlo
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.load('./variables.env');
mongoose.Promise = global.Promise;
console.log(process.env.DB);
mongoose.connect(process.env.DB, { useNewUrlParser: true });
mongoose.set('setFindAndModify', false);
//in case an error appears on the terminal

//Definir schema de clientes

const clientesSchema = new mongoose.Schema({
	nombre: String,
	apellido: String,
	empresa: String,
	emails: Array,
	edad: Number,
	tipo: String,
	pedidos: Array,
	vendedor: mongoose.Types.ObjectId
});

const Clientes = mongoose.model('clientes', clientesSchema);
//tabla clientes, sigue al clientesSchema

const productosSchema = new mongoose.Schema({
	nombre: String,
	precio: Number,
	stock: Number
});

const Productos = mongoose.model('productos', productosSchema);

//Pedidos
const pedidosSchema = new mongoose.Schema({
	pedido: Array,
	total: Number,
	fecha: Date,
	cliente: mongoose.Types.ObjectId, //sintaxis usada para almacenar IDs
	estado: String,
	vendedor: mongoose.Types.ObjectId,
	producto: mongoose.Types.ObjectId
});

const Pedidos = mongoose.model('pedidos', pedidosSchema);

//Usuarios

const usuariosSchema = new mongoose.Schema({
	usuario: String,
	nombre: String,
	password: String,
	rol: String
});
//Hashear passwords antes de guardarlos en BD
usuariosSchema.pre('save', function(next) {
	//si el password no está modificado, ejecutar la siguiente funcion
	if (!this.isModified('password')) {
		return next();
	}
	bcrypt.genSalt(10, (err, salt) => {
		//genera el salt, con el #de veces que va a hashear el password. Mientras más alto, más seguro y más lento
		if (err) return next(err);
		bcrypt.hash(this.password, salt, (err, hash) => {
			if (err) return next(err);
			this.password = hash;
			next();
		});
	});
});

const Usuarios = mongoose.model('usuarios', usuariosSchema);

export { Clientes, Productos, Pedidos, Usuarios };
