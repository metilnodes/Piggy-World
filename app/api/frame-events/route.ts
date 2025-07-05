import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Frame event received:", body)

    const { untrustedData } = body
    const { fid, messageHash, network, timestamp } = untrustedData || {}

    // Проверяем тип события
    if (body.type === "frame_added") {
      console.log(`🎉 Mini App added by user ${fid}`)

      // Здесь можно сохранить в базу данных или отправить уведомление
      // await saveFrameEvent(fid, 'frame_added', timestamp)

      return NextResponse.json({
        success: true,
        message: "Frame added successfully",
      })
    }

    if (body.type === "notifications_enabled") {
      console.log(`🔔 Notifications enabled by user ${fid}`)
      return NextResponse.json({
        success: true,
        message: "Notifications enabled",
      })
    }

    if (body.type === "notifications_disabled") {
      console.log(`🔕 Notifications disabled by user ${fid}`)
      return NextResponse.json({
        success: true,
        message: "Notifications disabled",
      })
    }

    if (body.type === "frame_removed") {
      console.log(`❌ Mini App removed by user ${fid}`)
      return NextResponse.json({
        success: true,
        message: "Frame removed",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Event processed",
    })
  } catch (error) {
    console.error("Frame event error:", error)
    return NextResponse.json({ error: "Failed to process frame event" }, { status: 500 })
  }
}
