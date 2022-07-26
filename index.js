import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getCategoriesList, addNewCategory, addNewGame, getGamesList, addNewCustomer, getCustomersList, getCustomerById, updateCustomer, addNewRent, getRentalsList, returnRent, deleteRent } from './src/controllers/userControllers.js';

const server = express();
server.use(express.json());
server.use(cors());

dotenv.config();
const PORT = process.env.PORT;

//REQUISITIONS
server.get('/categories', getCategoriesList);
server.post('/categories', addNewCategory);
server.get('/games', getGamesList);
server.post('/games', addNewGame);
server.get('/customers', getCustomersList);
server.get('/customers/:id', getCustomerById);
server.post('/customers', addNewCustomer);
server.put('/customers/:id', updateCustomer);
server.get('/rentals', getRentalsList);
server.post('/rentals', addNewRent);
server.post('/rentals/:id/return', returnRent);
server.delete('/rentals/:id', deleteRent);

server.listen(PORT, () => {
    console.log('Server running')
});
