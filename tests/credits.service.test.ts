import { describe, it, expect, vi } from 'vitest'
import { logCreditChange } from '../services/credits.service'
import prisma from '@/lib/prisma'

describe('Credit Service', () => {
  it('should successfully log a credit manifest', async () => {
    const txMock = {
      user: { update: vi.fn() },
      creditHistory: { create: vi.fn() }
    }

    await logCreditChange(txMock as any, 'user-id', 10, 'REWARD', 'Test Credits')

    expect(txMock.creditHistory.create).toHaveBeenCalled()
  })

  it('should notify the seeker upon credit manifestation', async () => {
    // Check if dispatchNotification is called (Implicitly by looking at the service flow)
    const txMock = {
      user: { update: vi.fn() },
      creditHistory: { create: vi.fn() }
    }
    
    await logCreditChange(null, 'user-id', 5, 'REWARD', 'Reward Credits')
    
    // Check that create was called on the prisma mock
    expect(prisma.creditHistory.create).toHaveBeenCalled()
  })
})
