const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testApiLogic() {
  const userId = 'cmndu4tpa0008vfywbinjo7ev' // The buddy_test account
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        credits: true,
        lastRefill: true,
        lastClaim: true,
        _count: {
          select: { generations: true }
        }
      }
    })
    console.log('USER_FETCH_SUCCESS:', JSON.stringify(user))
    
    // Test refill logic
    if (user) {
      const DAILY_REFILL = 5
      const now = new Date()
      const last = new Date(user.lastRefill)
      const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
      
      console.log('HOURS_SINCE:', hoursSince)
      
      if (hoursSince >= 24) {
        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: { increment: DAILY_REFILL },
            lastRefill: now
          },
          select: { credits: true }
        })
        console.log('UPDATE_SUCCESS:', JSON.stringify(updated))
      }
    }
  } catch (err) {
    console.error('API_LOGIC_ERROR:', err)
  } finally {
    await prisma.$disconnect()
  }
}

testApiLogic()
