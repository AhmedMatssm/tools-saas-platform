import { Queue, Worker, Job } from "bullmq"
import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
})

// Notification Queue
export const notificationQueue = new Queue("notifications", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
})

// We'll define the worker in a separate step or start it here if in dev
// In Next.js, we usually want to run the worker in a singleton or separate process.
// For this implementation, I'll provide a way to start it.
