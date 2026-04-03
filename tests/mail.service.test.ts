import { describe, it, expect, vi } from 'vitest'
import { sendEmail } from '../services/mail.service'
import nodemailer from 'nodemailer'

describe('Email Service', () => {
  it('should successfully dispatch a spectral mail', async () => {
    const result = await sendEmail({
      to: 'seeker@astral.ai',
      subject: 'Manifestation Complete',
      text: 'Your vision has been materialized in the Aura Network.'
    })

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('test-id')
  })

  it('should handle mailer failures gracefully', async () => {
    // Override the mock for failure simulation
    const mockedTransporter = nodemailer.createTransport()
    vi.mocked(mockedTransporter.sendMail).mockRejectedValueOnce(new Error('SMTP_INTERFERENCE'))

    const result = await sendEmail({
      to: 'interrupted@astral.ai',
      subject: 'Failed Aura'
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
