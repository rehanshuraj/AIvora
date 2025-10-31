import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import cors from 'cors'
connect();
const app = express();

app.use(cors({
  origin: 'https://aivora-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(morgan('dev')); //morgan is used to log the requests made to the server
app.use(express.json());
app.use(express.urlencoded({extended: true})); //it is used to parse the incoming requests with urlencoded payloads
app.use('/users', userRoutes); //user routes

// app.use('/users', userRoutes);
app.use('/projects', projectRoutes);

app.get('/',(req,res)=>{
    res.send("hello rehanshu")
})

export default app;