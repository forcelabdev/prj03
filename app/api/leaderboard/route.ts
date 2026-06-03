import { type NextRequest, NextResponse } from "next/server"
import { io as ioClient } from "socket.io-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.headers.get("x-auth-token") || ""

  return new Promise<NextResponse>((resolve) => {
    const timeout = setTimeout(() => {
      socket.disconnect()
      resolve(NextResponse.json({ error: "Timeout" }, { status: 504 }))
    }, 8000)

    // Döküman: io("/general", { auth: { token } }) — namespace /general
    const socket = ioClient("https://apievrymatrix5d84k321.com/general", {
      auth: token ? { token } : {},
      transports: ["polling", "websocket"],
      reconnection: false,
      timeout: 7000,
    })

    socket.on("connect", () => {
      // Backend: callback({ success: true, leaderboard: {...} })
      socket.emit("getLeaderboardData", { limit: 250 }, (response: any) => {
        clearTimeout(timeout)
        socket.disconnect()

        // Backend döndüğü format: { success: true, leaderboard: {...} }
        const lb = response?.leaderboard ?? response
        if (lb?.success === false || !lb?.winners) {
          return resolve(NextResponse.json({ leaderboard: { winners: [] } }))
        }
        resolve(NextResponse.json({ leaderboard: lb }))
      })
    })

    socket.on("connect_error", (err: any) => {
      clearTimeout(timeout)
      socket.disconnect()
      resolve(NextResponse.json({ error: "Connection failed", detail: err?.message }, { status: 502 }))
    })
  })
}
