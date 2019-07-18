import express = require('express')
import bodyparser = require('body-parser')
import {Metric, MetricsHandler } from './metrics'
const app = express()
const port: string = process.env.PORT || '8080'
app.set('views', __dirname + "/view")
app.set('view engine', 'ejs');

// Initialize connection once
var db: any
import mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient // Create a new MongoClient
MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err: any, client: any) => {
  if(err) throw err
  db = client.db('mydb')

  // Start the application after the database connection is ready
  const port: string = process.env.PORT || '8115'
  app.listen(port, (err: Error) => {
    if (err) {
      throw err
    }
    console.log(`server is listening on port ${port}`)
  })
});

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

app.post('/metrics', (req: any, res: any) => {
  if(req.body.value){
    const metric = new Metric(new Date().getTime().toString(), parseInt(req.body.value));
    new MetricsHandler(db).save(metric, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).json({error: err, result: true})
    })
  }else{
    return res.status(400).json({error: 'Wrong request parameter',});
  }
})

app.delete('/metrics', (req: any, res: any) =>{
  if(req.body.value){
    const metric = new Metric(new Date().getTime().toString(), parseInt(req.body.value));
    new MetricsHandler(db).remove(metric, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).json({error: err, result: true})
    })
  }else{
    return res.status(400).json({error: 'Wrong request parameter',});
  }
})

app.get('/metrics', (req: any, res: any) =>{
  if(req.body.value){
    const metric = new Metric(new Date().getTime().toString(), parseInt(req.body.value));
    new MetricsHandler(db).get(metric, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).json({error: err, result: true})
    })
  }else{
    return res.status(400).json({error: 'Wrong request parameter',});
  }
})

const insertManyDocuments = function(db: any, callback: any) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  const metrics: Metric[] = [
    { timestamp: new Date().getTime().toString(), value: 11},
    { timestamp: new Date().getTime().toString(), value: 22},
    { timestamp: new Date().getTime().toString(), value: 22},
  ]
  collection.insertMany(
    metrics,
    function(err: any, result: any) {
      if(err)
        throw err
      console.log("Document inserted into the collection");
      callback(result);
  });
}

const findDocuments = function(db: any, callback: any) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err: any, docs: object) {
    if(err)
      throw err
    console.log("Found the following documents");
    console.log(docs)
    callback(docs);
  });
}
