import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const server = express();
server.use(express.json());
server.use(cors());

dotenv.config();
const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log('Server running')
});
