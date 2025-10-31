import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import cors from 'cors';

connect();
const app = express();

// ✅ Allowed origins (both deployed & local)
const allowedOrigins = [
  'https://aivora-frontend.onrender.com', // your deployed frontend
  'http://localhost:5173' // for local dev (Vite default port)
];

// ✅ Enhanced CORS setup
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ✅ Log incoming requests
app.use(morgan('dev'));

// ✅ Middleware for JSON & URL-encoded form parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);

// ✅ Basic route
app.get('/', (req, res) => {
  res.send("Hello Rehanshu 🚀 Backend is running!");
});

// ✅ Handle CORS preflight manually (optional but safe)
app.options('*', cors());

export default app;
