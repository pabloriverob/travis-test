
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
  public save(metric: Metric, callback: (err: Error | null, result?: any) => void) {
    const collection = this.db.collection('documents')
    // Insert some document
    collection.insertOne(
      metric,
      function(err: any, result: any) {
        if(err)
        return callback(err, result)
        console.log("Document inserted into the collection")
        callback(err, result)
    });
  }

  public remove(metric: Metric, callback: (err: Error | null, result?: any) => void) {
    const collection = this.db.collection('documents')
    // Delete some document
    console.log(metric)
    collection.remove(
      {value: metric.value},
      function(err: any, result: any) {
        if(err)
        return callback(err, result)
        console.log("Document deleted from the collection")
        callback(err, result)
    });
  }

  public get(metric: Metric, callback: (err: Error | null, result?: any) => void) {
    const collection = this.db.collection('documents')
    // Delete some document
    collection.find({"value" : metric.value}).toArray(function(err: any, result: object) {
        if(err)
        return callback(err, result)
        console.log("Document gotten from the collection")
        callback(err, result)
    });
  }
}
