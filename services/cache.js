const mongoose = require('mongoose');
const util = require('util');

const redis = require('redis');
const key = require('../config/keys');
const redisUrl = key.redisUrl;
//const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);

client.hget = util.promisify(client.hget);


const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}){
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function(){

if(this.useCache)
{
  const key = JSON.stringify(Object.assign({}, this.getQuery(),{collection : this.mongooseCollection.name}));
  const cachedResult = await client.hget(this.hashKey, key);

  if(cachedResult){
     const doc = JSON.parse(cachedResult);

     const results = Array.isArray(doc) ?  doc.map(el => new this.model(el)) : this.model(doc);
     return results;
   }

  const result = await exec.apply(this,arguments);
  client.hset(this.hashKey,key,JSON.stringify(result))
  return result;
 }
 const result = await exec.apply(this,arguments);
 return result;
}
module.exports = {
  clearHash(key){
    client.del(JSON.stringify(key));
  }
}
