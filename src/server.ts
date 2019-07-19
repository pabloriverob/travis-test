import express = require('express')
import bodyparser = require('body-parser')
import {Metric, MetricsHandler } from './metrics'
import session = require('express-session')
import ConnectMongo = require('connect-mongo')
import mongodb = require('mongodb')
import { UserHandler, User } from './user'

const app = express()
app.set('views', __dirname + "/view")
app.set('view engine', 'ejs');

// Initialize connection once
var db: any
let dbUser: any

const MongoClient = mongodb.MongoClient // Create a new MongoClient
MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err: any, client: any) => {
  if(err) throw err
  db = client.db('mydb')
  dbUser=new UserHandler(db)

  // Start the application after the database connection is ready
  const port: string = process.env.PORT || '8117'
  app.listen(port, (err: Error) => {
    if (err) {
      throw err
    }
    console.log(`server is listening on port ${port}`)
  })
});
const MongoStore = ConnectMongo(session)

app.use(session({
  secret: 'user session',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ url: 'mongodb://localhost/mydb' })
}))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

app.post('/metrics', (req: any, res: any) => {
  if(req.body){
    const metric = new Metric(new Date().getTime().toString(), parseInt(req.body.value));
    new MetricsHandler(db).save(metric, req.session.user.username, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).redirect('/')
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
    new MetricsHandler(db).get(req.session.user.username, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
        console.log(result)
      res.status(201).json({error: err, result: result})
    })
})

/*
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
      console.log(result);
      callback(result);
  });
}*/

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
dbUser = new UserHandler(db)
const authRouter = express.Router()

authRouter.get('/login', function (req: any, res: any) {
  res.render('login')
})

authRouter.get('/signup', function (req: any, res: any) {
  res.render('signup')

})

authRouter.get('/logout', function (req: any, res: any) {
  if (req.session.loggedIn) {
    delete req.session.loggedIn
    delete req.session.user
  }
  res.redirect('/login')
})
authRouter.post('/login', function (req: any, res: any, next: any) {
  dbUser.get(req.body.username, function (err: Error | null, result: User | null) {
    if (err) next(err)
    if (result === null || !result.validatePassword(req.body.password)) {
      console.log('login')
      res.redirect('/login')
    } else {
      req.session.loggedIn = true
      req.session.user = result
      res.redirect('/')
    }
  })
})

app.use(authRouter)
const userRouter = express.Router()

userRouter.post('/signup', function (req: any, res: any, next: any) {
  dbUser.get(req.body.username, function (err: Error | null, result: User | null) {
    if (err) next(err)
    if (result) {
      res.status(409).send("user already exists")
    } else {
      dbUser.save(req.body, function (err: Error | null) {
        if (err) next(err)
        else res.redirect('/')
      })
    }
  })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result: User | null) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

app.use(userRouter)

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  console.log(req.session)
  res.render('hello.ejs', {username: req.session.user.username, email: req.session.user.email})
})
app.post('/userdelete', (req: any, res: any) => {
    var username = req.session.user.username
    new MetricsHandler(db).remove(username, (err: any, result: any) => {
      if (err)
        console.log("Hello")
    })
    console.log("Partial Success")
    new UserHandler(db).remove(username, (err: any, result: any) => {
      if (err)
      res.status(201).json({error: err, result: true})
    })
  if (req.session.loggedIn) {
    delete req.session.loggedIn
    delete req.session.user
  }
  res.redirect('/login')
})
