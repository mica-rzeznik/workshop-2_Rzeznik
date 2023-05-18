import express from 'express';
import __dirname from './util.js';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
//Cookies si aplica:
import cookieParser from 'cookie-parser';
//Passport imports
import passport from 'passport';
import initializePassport from './config/passport.config.js'


//Routers a importar:
import studentRouter from './routes/students.router.js'
import coursesRouter from './routes/courses.router.js'
import viewsRouter from "./routes/views.router.js";
import usersViewRouter from './routes/users.view.router.js'
import jwtRouter from './routes/jwt.router.js'
import StudentsExtendRouter from './routes/custom/students.extend.router.js';

//Declarando Express para usar sus funciones.
const app = express();

//Preparar la configuracion del servidor para recibir objetos JSON.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/**
 * Template engine
 */
app.engine('handlebars',handlebars.engine());
app.set('views',__dirname+'/views');
app.set('view engine','handlebars');
app.use(express.static(__dirname+'/public'))


app.use(cookieParser('jwtCookieToken'))

initializePassport(passport);
app.use(passport.initialize());
// app.use(passport.session());

//Declaración de Routers:
app.use('/',viewsRouter);
app.use("/api/students", studentRouter);
app.use("/api/courses", coursesRouter);
app.use("/users", usersViewRouter);
app.use("/api/jwt", jwtRouter);

const studentsExtendRouter = new StudentsExtendRouter();
app.use("/api/extend/users", studentsExtendRouter.getRouter());

const SERVER_PORT = 9090;
app.listen(SERVER_PORT, () => {
    console.log("Servidor escuchando por el puerto: " + SERVER_PORT);
});

const connectMongoDB = async ()=>{
    try {
        await mongoose.connect('mongodb+srv://admin:admin@cluster0.28dpnsm.mongodb.net/colegio');
        console.log("Conectado con exito a MongoDB usando Moongose.");
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
};
connectMongoDB();