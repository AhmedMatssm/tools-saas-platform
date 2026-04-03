import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ── GLOBAL MOCKS ───────────────────────────────────────────────

vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    addBulk: vi.fn(),
    on: vi.fn(),
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
  })),
}))

vi.mock('ioredis', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    quit: vi.fn(),
  })),
}))

vi.mock('pusher', () => ({
  default: vi.fn().mockImplementation(() => ({
    trigger: vi.fn().mockResolvedValue({}),
  })),
}))

vi.mock('pusher-js', () => ({
  default: vi.fn().mockImplementation(() => ({
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn(),
    }),
  })),
}))

// ── PROJECT MOCKS ──────────────────────────────────────────────

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    creditHistory: {
      create: vi.fn(),
    },
    notificationSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb({
        user: { update: vi.fn() },
        creditHistory: { create: vi.fn() }
    }))
  },
}))

vi.mock('@/lib/pusher', () => ({
  pusherServer: {
    trigger: vi.fn().mockResolvedValue({}),
  },
  getPusherClient: vi.fn().mockReturnValue({
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn(),
    }),
  }),
  pusherClient: {
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn(),
    }),
  }
}))

vi.mock('@/lib/bullmq', () => ({
  notificationQueue: {
    add: vi.fn(),
    addBulk: vi.fn(),
  }
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' })
    })
  }
}))
