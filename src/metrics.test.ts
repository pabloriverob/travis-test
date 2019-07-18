import {expect} from 'chai'
import { Metric, MetricsHandler } from './metrics'
import mongodb = require('mongodb')

var dbMet: MetricsHandler
var db: any
var clientDb: any

var mongoAsync = (callback: any) => {
  const MongoClient = mongodb.MongoClient // Create a new MongoClient
  MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err: any, client: any) => {
    if(err) throw err
    callback(client)
  });
}

describe('Metrics', () => {
  before((done) =>  {
    mongoAsync((client: any) => {
      clientDb = client
      db = clientDb.db('mydb')
      dbMet = new MetricsHandler(db)
      done()
    })
  })

  after(() => {
    clientDb.close()
  })

  describe('/get', () =>  {
    it('should get empty array', function() {
      const metric = new Metric(new Date().getTime().toString(), 18);
      dbMet.get(metric, function(err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })
  })

  // describe('/remove', () =>{
  //   it('should delete empty array', function(){
  //     const metric = new Metric(new Date().getTime().toString(), 17);
  //     dbMet.remove(metric, function(err: Error | null, result?: Metric[]){
  //       expect(err).to.be.null
  //       expect(result).to.not.be.undefined
  //       expect(result).to.be.empty
  //     })
  //   })
  //
  // })
})
