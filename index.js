const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors({
  origin : ['http://localhost:5173'],
  credentials : true
}))
app.use(express.json())
app.use(cookieParser())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrkwx23.mongodb.net/?retryWrites=true&w=majority`;
 
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const carCollection = client.db('cardDB').collection('services')
    const bookCollection = client.db('cardDB').collection('booking')
    //  auth related api 

    app.post('/jwt', async(req,res) => {
      const user = req.body
      console.log(user);
      const token = jwt.sign(user, process.env.SECRET, {expiresIn : '1hr'})
      res
      .cookie('token', token, {
        httpOnly : true,
        secure : false,
        
      })
      .send({success : true})
    })


    // services related api 
    app.get('/services', async(req,res) => {
        const corsur = await carCollection.find().toArray()
        res.send(corsur)
    })

    app.get('/services/:id', async(req,res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const option = {
        projection : { title: 1 , price: 1, service_id:1, img: 1 }
      }
      const result = await carCollection.findOne(query,option)
      res.send(result)
    })

    // booking part use collection 
    app.post('/booking', async(req,res) => {
      const postBook = req.body
      const result = await bookCollection.insertOne(postBook)
      res.send(result)
    })
    app.get('/booking', async(req,res) => {
      let query = {}
      if(req.query?.email){
        query = {email : req.query.email}
      }
      const result = await bookCollection.find(query).toArray()
      res.send(result)
    })
    app.delete('/booking/:id', async(req,res) => {
       const id = req.params.id
       const query = {_id : new ObjectId(id)}
       const result = await bookCollection.deleteOne(query)
       res.send(result)
    })
    app.patch('/booking/:id' , async(req,res) => {
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const updateUser = req.body
      const updateDoc ={
        $set : {
          status : updateUser.status
        }
      }
      const result = await bookCollection.updateOne(filter,updateDoc)
      res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
     
  }
}
run().catch(console.dir);

app.get("/", (req, res) => res.send("Server Brows is running"));

app.listen(port, () => console.log(`Server port is Running ${port}`));
