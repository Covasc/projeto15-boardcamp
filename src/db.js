import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
const user = process.env.USER;
const password = process.env.PASSWORD;
const host = process.env.URI;
const port = 5432;
const database = 'database_name';

const conection = new Pool ({
    user, 
    password, 
    host,
    port,
    database
});
