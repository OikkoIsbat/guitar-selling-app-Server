const express = require('express');
const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors');

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggtng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('guitar-seller');
        const productsCollection = database.collection('products');

        const ordersCollection = database.collection('order');

        const reviewCollection = database.collection('reviews');

        const usersCollection = database.collection('users');

        //POST API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });
        //GET SINGLE PRODUCT
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting ', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        //GET PRODUCTS API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);

        })

        //GET ALL ORDERS
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })
        //GET ORDERS BY EMAIL
        app.get('/orders/:email', async (req, res) => {
            const cursor = ordersCollection.find({ email: req.params.email });
            const orders = await cursor.toArray();
            res.send(orders);
        })

        //GET ALL REVIEWS
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        })

        //POST REVIEW
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            console.log('review hitted', req.body);
            res.json(result);
        })

        //POST ALL ORDERS
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            console.log('hitting', req.body);
            res.json(result);

        })

        //DELETE AN ORDER 
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting the user', result);
            res.json(result);
        })

        //UPDATE STATUS
        app.put('/updateStatus/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            console.log(updatedStatus);
            const result = await ordersCollection.updateOne(filter, {
                $set: { status: updatedStatus },
            });
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.emailSubmit };
            console.log(filter);
            const updateDocs = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDocs);
            res.json(result);
        })

        //DELETE PRODUCT
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('delete this -_-', id);
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            console.log('deleting this prod', result);
            res.json(result);
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running server..')
});

app.listen(port, () => {
    console.log('running on port ', port);
})