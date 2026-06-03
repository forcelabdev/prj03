import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, username, cryptoType, amount, txHash } = body

    if (!token || !username || !cryptoType) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      )
    }

    // Backend'e ödeme doğrulaması yap
    // Socket event: verifyPayment
    const socketResponse = await new Promise((resolve, reject) => {
      // Socket bağlantısı kur
      const { io: ioClient } = require('socket.io-client')
      const socket = ioClient('https://apievrymatrix5d84k321.com/general', {
        auth: { token },
        transports: ['polling', 'websocket'],
        reconnection: false,
        timeout: 7000,
      })

      socket.on('connect', () => {
        socket.emit('verifyPayment', {
          username,
          cryptoType,
          amount,
          txHash,
        }, (response: any) => {
          socket.disconnect()
          resolve(response)
        })

        setTimeout(() => {
          socket.disconnect()
          reject(new Error('Timeout'))
        }, 7000)
      })

      socket.on('connect_error', (err: any) => {
        socket.disconnect()
        reject(err)
      })
    })

    return NextResponse.json({ success: true, data: socketResponse })
  } catch (error) {
    console.error('Deposit verify error:', error)
    return NextResponse.json(
      { error: 'Doğrulama başarısız' },
      { status: 500 }
    )
  }
}
