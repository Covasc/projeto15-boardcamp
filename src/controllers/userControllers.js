import conection from "../db.js";
import joi from 'joi';
import dayjs from "dayjs";

export async function getCategoriesList(request, response) {
    //RETURNS ALL GAME CATEGORIES REGISTRED

    try {
        const { rows: categoriesList } = await conection.query(
            'SELECT * FROM categories'
        );
        return response.status(200).send(categoriesList);
    } catch (error) {
        //RETURNING INTERNAL SERVER ERROR
        console.log(error);
        return response.sendStatus(500);
    };
};

export async function addNewCategory(request, response) {

    const newCategory = request.body;

    const schema = joi.object({
        name: joi.string().required()
    });
    const bodyValidation = schema.validate(newCategory);

    if (bodyValidation.error) {
        return response.sendStatus(400);
    };

    try {
        const { rows: categoryExists } = await conection.query(
            `SELECT categories.name FROM categories WHERE name = $1`, [newCategory.name]
        );

        if (categoryExists[0]?.name) {
            return response.sendStatus(409);
        } else {
            await conection.query(
                'INSERT INTO categories(name) VALUES ($1)', [newCategory.name]
            );
            return response.sendStatus(201);
        };

    } catch (error) {
        //RETURNING INTERNAL SERVER ERROR
        console.log(error);
        return response.sendStatus(500);
    };

};

export async function getGamesList(request, response) {
    
    let search = request.query.name;
    let gamesList;

    try {
        if (search) {
            search = search.toLowerCase() + "%";
            gamesList = await conection.query(
                `SELECT games.*, categories.name as "categoryName" FROM games 
                JOIN categories ON games."categoryId" = categories.id
                WHERE LOWER(games.name) LIKE $1;`, [search]
            );
        } else {
            gamesList  = await conection.query(
                `SELECT games.*, categories.name as "categoryName" FROM games
                JOIN categories ON games."categoryId" = categories.id`
            );
        };
        return response.send(gamesList.rows);

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
};

export async function addNewGame(request, response) {

    const newGame = request.body;
    const entrySchema = joi.object({
        name: joi.string().required(),
        image: joi.string().required(),
        stockTotal: joi.number().min(1).required(),
        categoryId: joi.number().required(),
        pricePerDay: joi.number().min(1).required()
    });
    const validation = entrySchema.validate(newGame);
    if (validation.error) {
        console.log(validation.error.details);
        //UNPROCESSABLE ENTITY
        return response.sendStatus(422);
    };

    try {
        const { rows: categoryExists } = await conection.query(
            `SELECT categories.name FROM categories WHERE id = $1;`, [newGame.categoryId]
        );
        if (!categoryExists[0]?.name) {
            return response.sendStatus(400);
        };
        
        const { rows: gameExists } = await conection.query(
            `SELECT name FROM games WHERE name = $1;`, [newGame.name]
        );
        if (gameExists[0]?.name) {
            return response.sendStatus(409);
        } else {
            await conection.query(
                'INSERT INTO games(name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);',
                [newGame.name, newGame.image, newGame.stockTotal, newGame.categoryId, newGame.pricePerDay]
            );
            return response.sendStatus(201);
        };

    } catch (error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
};

export async function getCustomersList(request, response) {
    
    let search = request.query.cpf;
    let customersList;

    try {
        if (search) {
            search = search.toLowerCase() + "%";
            customersList = await conection.query(
                `SELECT * FROM customers
                WHERE cpf LIKE $1;`, [search]
            );
        } else {
            customersList  = await conection.query(
                `SELECT * FROM customers`
            );
        };
        return response.send(customersList.rows);

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
};

export async function getCustomerById(request, response) {

    let id = Number(request.params.id);

    try {
        const { rows: customer } = await conection.query(
            `SELECT * FROM customers
            WHERE id = $1;`, [id]
        );
        if (customer[0]?.name) {
            return response.send(customer);
        } else {
            return response.sendStatus(404);
        };

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
}

export async function addNewCustomer(request, response) {

    const newClient = request.body;
    const entrySchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/[0-9]{10,11}$/).required(),
        cpf: joi.string().pattern(/[0-9]{11}$/).required(),
        birthday: joi.string().pattern(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/).required()
    })
    const validation = entrySchema.validate(newClient);
    if (validation.error) {
        console.log(validation.error.details);
        //UNPROCESSABLE ENTITY
        return response.sendStatus(400);
    };

    try {
        const { rows: isCpfUsed } = await conection.query(
            `SELECT name FROM customers WHERE cpf = $1`,
            [newClient.cpf] 
        )
        if (isCpfUsed[0]?.name) {
            return response.sendStatus(409);
        } else {
            await conection.query(
                `INSERT INTO customers(name, phone, cpf, birthday) 
                VALUES ($1, $2, $3, $4)`,
                [newClient.name, newClient.phone, newClient.cpf, newClient.birthday]
            );
            return response.sendStatus(201);
        }

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
};

export async function updateCustomer(request, response) {

    const id = Number(request.params.id);
    const newClientData = request.body;
    const entrySchema = joi.object({
        name: joi.string().required(),
        phone: joi.string().pattern(/[0-9]{10,11}$/).required(),
        cpf: joi.string().pattern(/[0-9]{11}$/).required(),
        birthday: joi.string().pattern(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/).required()
    })
    const validation = entrySchema.validate(newClientData);
    if (validation.error) {
        console.log(validation.error.details);
        //UNPROCESSABLE ENTITY
        return response.sendStatus(400);
    };

    try {
        const { rows: isCpfUsed } = await conection.query(
            `SELECT * FROM customers WHERE cpf = $1`,
            [newClientData.cpf] 
        )
        if (isCpfUsed[0]?.cpf && isCpfUsed[0]?.id != id) {
            return response.sendStatus(409);
        } else {
            await conection.query(
                `UPDATE customers SET name = $2, phone = $3, cpf = $4, birthday = $5
                WHERE id = $1`,
                [id, newClientData.name, newClientData.phone, newClientData.cpf, newClientData.birthday]
            );
            return response.sendStatus(200);
        }

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
}

export async function getRentalsList(request, response) {

    const customerSearch = Number(request.query.customerId);
    const gameSearch = Number(request.query.gameId);
    let rentalsList;

    try {
        if (customerSearch) {
            rentalsList = await conection.query(
                `SELECT rentals.*, customers.id, customers.name as "customerName", games.id, games.name as "gameName", games."categoryId", categories.name AS "categoryName" FROM rentals
                JOIN customers ON rentals."customerId" = customers.id
                JOIN games ON rentals."gameId" = games.id
                JOIN categories ON games."categoryId" = categories.id
                WHERE rentals."customerId" = $1`, [customerSearch]
            );
        } else {
            if (gameSearch) {
                rentalsList = await conection.query(
                    `SELECT rentals.*, customers.id, customers.name as "customerName", games.id, games.name as "gameName", games."categoryId", categories.name AS "categoryName" FROM rentals
                    JOIN customers ON rentals."customerId" = customers.id
                    JOIN games ON rentals."gameId" = games.id
                    JOIN categories ON games."categoryId" = categories.id
                    WHERE rentals."gameId" = $1`, [gameSearch]
                );
            } else {
                rentalsList  = await conection.query(
                    `SELECT rentals.*, customers.id, customers.name as "customerName", games.id, games.name as 'gameName", games."categoryId", categories.name AS "categoryName" FROM rentals
                    JOIN customers ON rentals."customerId" = customers.id
                    JOIN games ON rentals."gameId" = games.id
                    JOIN categories ON games."categoryId" = categories.id`
                );
            };
        };

        for ( let rent of rentalsList.rows ) {
            rent.customer = { id: rent.customerId, name: rent.customerName };
            rent.game = { id: rent.gameId, name: rent.gameName, categoryId: rent.categoryId, categoryName: rent.categoryName };
            delete rent.customerName;
            delete rent.gameName;
            delete rent.categoryId;
            delete rent.categoryName;
        }

        return response.send(rentalsList.rows);

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
}

export async function addNewRent(request, response) {

    const rent = request.body;
    const entrySchema = joi.object({
        customerId: joi.number().required(),
        gameId: joi.number().min(1).required(),
        daysRented: joi.number().required()
    });
    const validation = entrySchema.validate(rent);
    if (validation.error) {
        console.log(validation.error.details);
        return response.sendStatus(400);
    }

    try {
        const { rows: gameList} = await conection.query(
            `SELECT * FROM games WHERE id = $1`, [rent.gameId]
        );
        const { rows: customerList} = await conection.query(
            `SELECT * FROM customers WHERE id = $1`, [rent.customerId]
        );
        const { rows: rents } = await conection.query(
            `SELECT * FROM rentals WHERE "gameId"= $1 AND "returnDate" IS NULL`, [rent.gameId]
        );
        const numberOfRents = rents.length;
        const game = gameList[0];
        const customer = customerList[0];

        if (game?.name && customer?.name && game?.stockTotal > numberOfRents) {
            await conection.query(
                `INSERT INTO rentals("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
                VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
                [customer.id, game.id, dayjs(Date()).format('YYYY-MM-DD'),rent.daysRented, null, game.pricePerDay*rent.daysRented, null]
            );
            return response.sendStatus(201);
        } else {
            return response.sendStatus(400);
        };
    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
}

export async function returnRent (request, response) {

    const id = Number(request.params.id);

    try {
        const { rows: rentExists } = await conection.query(
            `SELECT * FROM rentals WHERE id = $1`,
            [id] 
        )
        if (rentExists[0]?.id && rentExists[0]?.returnDate == null) {
            
            const renturnDay = dayjs(rentExists[0].rentDate);
            const days = Math.ceil(renturnDay.diff(Date(), 'day', true));
            const pricePerDay = rentExists[0].originalPrice / rentExists[0].daysRented;
            let delayFee;

            days < 0 ? delayFee = days*pricePerDay*-1 : delayFee = 0;
            
            await conection.query(
                `UPDATE rentals SET "returnDate" = $2, "delayFee" = $3
                WHERE id = $1`,
                [id, dayjs(Date()).format('YYYY-MM-DD'), delayFee]
            );
            return response.sendStatus(200);
        } else {
            return response.sendStatus(400);
        }

    } catch(error) {
        console.log(error);
        //RETURNING INTERNAL SERVER ERROR
        return response.sendStatus(500);
    };
}