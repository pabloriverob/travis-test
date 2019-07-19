
export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {
  private db: any

  constructor(db) {
    this.db = db
  }
  public save(metric: Metric, username: string, callback: (err: Error | null, result?: any) => void) {
    const collection = this.db.collection('users')
    // Insert some document
    var newvalues = { $push: {"metrics": metric}};
    collection.updateOne({username: username}, newvalues, function(err:any, result:any) {
      if(err)
      return callback(err, result)
      console.log("Document inserted into the collection")
      callback(err, result)
    })
  }

  public remove(metric: Metric, callback: (err: Error | null, result?: any) => void) {
    const collection = this.db.collection('users')
    // Delete some document
    console.log(metric)
    collection.removeOne(
      {value: metric.value},
      function(err: any, result: any) {
        if(err)
        return callback(err, result)
        console.log("Document deleted from the collection")
        callback(err, result)
    });
  }

  public get(username: string, callback: (err: Error | null, result?: any) => void) {
    const collection = this.db.collection('users')
    // Delete some document
    collection.find({username: username}).toArray(function(err: any, result: object) {
        if(err)
        return callback(err, result)
        console.log("Document gotten from the collection")
        callback(err, result)
    });
  }
}
