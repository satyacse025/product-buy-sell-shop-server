const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;
app.use(cors({origin:true}));

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const uri = "mongodb://localhost:27017/";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeee7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const categoriesCollection = client.db("productBuySell").collection("categories");
    // const productsCollection = client.db("productBuySell").collection("products");
    const carsCollection = client.db("productBuySell").collection("cars");

    const usersCollection = client.db("productBuySell").collection("users");


    app.get("/categories", async (req, res) => {
      const query = categoriesCollection.find();
      const result = await query.toArray();
      res.send(result);
    });
    app.get("/products", async (req, res) => {
      const query = carsCollection.find();
      const result = await query.toArray();
      res.send(result);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.findOne(query);
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.post("/category", async (req, res) => {
      const category = req.body;
      const result = await categoriesCollection.insertOne(category);
      res.send(result);
    });

    app.post("/product", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await carsCollection.insertOne(product);
      res.send(result);
    });

    app.put("/category/:id", async (req, res) => {
      const id = req.params.id;
      const category = req.body;
      console.log(id, category);

      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updatedCategory = {
        $set: {
          name: category.name,
          imageURL: category.imageURL,
          isActive: category.isActive,

        },
      };

      const result = await categoriesCollection.updateOne(
        filter,
        updatedCategory,
        option
      );
      res.send(result);
    });
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;


      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updatedProduct = {
        $set: {
        
          carName: product.carName,
          categoryId: product.categoryId,
          category: product.category,
          image: product.image,
          sellPrice: product.sellPrice,
          carBrand: product.carBrand,
          carModel: product.carModel,
          carColor: product.carColor,
          carMileage: product.carMileage,

        },
      };

      const result = await carsCollection.updateOne(
        filter,
        updatedProduct,
        option
      );
      res.send(result);
    });
    app.delete("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await categoriesCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch((error) => console.log(error));



app.get("/", (req, res) => {
    res.send("Bootcamp React Node CRUD Server is Running");
});

app.listen(port, () => {
    console.log(`Bootcamp React Node CRUD Server is Running on ${port}`);
});