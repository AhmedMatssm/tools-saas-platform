import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // 1. DB check
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        platform: "operational"
      }
    })
  } catch (error) {
    return NextResponse.json({
        status: "degraded",
        services: {
            database: "disconnected"
        }
    }, { status: 500 })
  }
}
