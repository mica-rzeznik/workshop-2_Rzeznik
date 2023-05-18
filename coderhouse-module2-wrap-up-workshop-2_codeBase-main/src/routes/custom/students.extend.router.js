import CustomRouter from './custom.router.js';
import StudentService from '../../services/db/students.service.js';
import { createHash, isValidPassword, generateJWToken } from '../../util.js';

export default class StudentsExtendRouter extends CustomRouter {
    init() {
        const studentService = new StudentService();
        this.get("/", ["PUBLIC"], async (req, res) => {
            let students = await studentService.getAll();
            res.sendSuccess(students);
        });
        this.post("/login", ['PUBLIC'], async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await studentService.findByUsername(email);
                if (!user) {
                    console.warn("User doesn't exists with username: " + email);
                    return res.status(202).send({ error: "Not found", message: "Usuario no encontrado con username: " + email });
                }
                if (!isValidPassword(user, password)) {
                    console.warn("Invalid credentials for user: " + email);
                    return res.status(401).send({ status: "error", error: "El usuario y la contraseña no coinciden!" });
                }
                const tokenUser = {
                    name : `${user.name} ${user.lastName}`,
                    email: user.email,
                    age: user.age,
                    role: user.role
                };
                const access_token = generateJWToken(tokenUser);
                res.cookie('jwtCookieToken', access_token, {
                    maxAge: 60000,
                    httpOnly: true
                });
                res.send({ message: "Login successful!", access_token: access_token, id: user._id });
            } catch (error) {
                console.error(error);
                return res.status(500).send({ status: "error", error: "Error interno de la applicacion." });
            }
        });
        this.post("/register", ["PUBLIC"], async (req, res) => {
            const { name, lastName, email, age, password } = req.body;
            const exists = await studentService.findByUsername(email);
            if (exists) {
                return res.status(400).send({ status: "error", message: "Usuario ya existe." });
            }
            const user = {
                name,
                lastName,
                email,
                age,
                password: createHash(password) 
            };
            const result = await studentService.save(user);
            res.status(201).send({ status: "success", message: "Usuario creado con extito con ID: " + result.id });
        });
    }
};