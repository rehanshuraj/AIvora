import 'dotenv/config';// Load environment variables from .env file

import http from  'http';
import app from './app.js';


const port = process.env.port || 3000;


const server = http.createServer(app);


server.listen(port,()=> {
    console.log(`Server is running on port ${port}`);
})
