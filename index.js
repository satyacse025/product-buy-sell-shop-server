const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;
app.use(cors({ origin: true }));

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
    const carsCollection = client.db("productBuySell").collection("cars");

    const usersCollection = client.db("productBuySell").collection("users");
    const cartsCollection = client.db("productBuySell").collection("carts");


    app.get("/categories", async (req, res) => {
      const query = categoriesCollection.find();
      const result = await query.toArray();
      res.send(result);
    });
    app.get("/products", async (req, res) => {
      // const query = carsCollection.find();
      // const result = await query.toArray();
      // res.send(result);
      const productsWithCategories = await carsCollection
        .aggregate([
          {

            $lookup: {
              from: 'categories',
              let: { categoryId: { $toObjectId: '$categoryId' } },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$categoryId'] } } }
              ],
              as: 'category_info'
            },
          },
          {
            $unwind: '$category_info',      // flatten the category_info array
          },
          {
            $project: {
              carName: 1,
              image: 1,
              sellPrice: 1,
              carBrand: 1,
              carModel: 1,
              carColor: 1,
              carMileage: 1,
              carDisplacement: 1,
              rating: 1,
              categoryName: '$category_info.name', // project category name
            },
          },

        ])
        .toArray();

      res.json(productsWithCategories);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });
    app.get("/product/category/:categoryId", async (req, res) => {
      const categoryId = req.params.categoryId;
      const query = carsCollection.find({ categoryId: categoryId });
      const result = await query.toArray();
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
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      const result = await cartsCollection.insertOne(cart);
      res.send(result);
    });
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.get("/user/profile/:email", async (req, res) => {
      const email = req.params.email;
      const query = usersCollection.find({ email: email });
      const result = await query.toArray();
      res.send(result);
    });
    app.get("/user/myproducts/:email", async (req, res) => {
      const email = req.params.email;
      const query = cartsCollection.find({ customerEmail: email });
      const result = await query.toArray();
      res.send(result);
    });
    app.get("/user/role/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email }, { projection: { userType: 1 }});
      if (user && user.userType) {
        res.send({ userType: user.userType });
      }
    });
    app.get("/users", async (req, res) => {
      const query = usersCollection.find();
      const result = await query.toArray();
      res.send(result);
    });
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
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
          carDisplacement: product.carDisplacement,
          rating: product.rating,

        },
      };

      const result = await carsCollection.updateOne(
        filter,
        updatedProduct,
        option
      );
      res.send(result);
    });
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;

      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updatedUser = {
        $set: {
          name: user.name,
          imageURL: user.imageURL,
          address: user.address,
          phone: user.phone,

        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      res.send(result);
    });
    app.put("/user-type/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;

      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updatedUser = {
        $set: {
          userType: user.userType,

        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedUser,
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