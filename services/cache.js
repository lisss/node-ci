const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const { redisUrl } = require('../config/keys');
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
};

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        Object.assign({}, this.getFilter(), {
            collection: this.mongooseCollection.name,
        })
    );

    const cacheValue = await client.hget(this.hashKey, key);
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
            ? doc.map((x) => new this.model(x))
            : new this.model(doc);
    }

    const res = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(res));
    return res;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    },
};
