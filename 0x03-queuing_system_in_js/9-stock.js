import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

const app = express();
const client = createClient();
const HOST = '127.0.0.1';
const PORT = 1245;
const listProducts = [{
    id: 1, name: 'Suitcase 250', price: 50, stock: 4,
},
{
    id: 2, name: 'Suitcase 450', price: 100, stock: 10,
},
{
    id: 3, name: 'Suitcase 650', price: 350, stock: 2,
},
{
    id: 4, name: 'Suitcase 1050', price: 550, stock: 5,
},
];

/**
 * Searches for product in listProducts based on id parameter
 */
function getItemById(id) {
    return listProducts.find((product) => product.id === id);
}

// Redis client ops
client.on('error', (error) => {
    console.log(`Redis client not connected to server ${error.message}`);
});

/**
 * Stores itemId-stock key-value pair in redis
 */
function reserveStockById(itemId, stock) {
    client.set(`item.${itemId}`, stock);
}

/**
 * Gets stock value associated with given item id (as key)
 * in Redis
 */
async function getCurrentReservedStockById(itemId) {
    const getAsync = promisify(client.get).bind(client);
    const value = await getAsync(`item.${itemId}`);
    return value;
}

// Express app routes
/* Get list of all products */
app.get('/list_products', (_requ, resp) => {
    resp.send(listProducts.map((prod) => ({
        itemId: prod.id,
        itemName: prod.name,
        price: prod.price,
        initialAvailableQuantity: prod.stock,
    })));
});

/* Get items by given id */
app.get('/list_products/:itemId', async (requ, resp) => {
    const { itemId } = requ.params;
    const prod = getItemById(Number(itemId));
    if (prod === undefined) {
        resp.statusCode = 404;
        resp.send({ status: 'Product not found' });
    } else {
        const reserveStock = await getCurrentReservedStockById(prod.id);
        resp.send({
            itemId: prod.id,
            itemName: prod.name,
            price: prod.price,
            initialAvailableQuantity: prod.stock,
            currentQuantity: reserveStock === null ? prod.stock : Number(reserveStock),
        });
    }
});

/* Reserve a product with given id if it exists and in stock */
app.get('/reserve_product/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const product = getItemById(Number(itemId));
    if (product === undefined) {
        res.statusCode = 404;
        res.send({ status: 'Product not found' });
        return;
    }
    let reserveStock = await getCurrentReservedStockById(product.id);
    reserveStock = reserveStock === null ? product.stock : Number(reserveStock);
    if (!reserveStock) {
        res.send({ status: 'Not enough stock available', ItemId: product.id });
    } else {
        reserveStockById(product.id, reserveStock - 1);
        res.send({ status: 'Reservation confirmed', ItemId: product.id });
    }
});

app.listen(PORT, HOST, function() {
    console.log(`Server is live at ${HOST}:${PORT}`);
});
