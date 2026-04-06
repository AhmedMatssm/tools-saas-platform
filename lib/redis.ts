import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const redisClientSingleton = () => {
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  })
}

declare global {
  var redis: undefined | ReturnType<typeof redisClientSingleton>
}

const redis = globalThis.redis ?? redisClientSingleton()

export default redis

if (process.env.NODE_ENV !== "production") globalThis.redis = redis
