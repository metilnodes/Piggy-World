import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

// export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
    // Получаем параметры из URL
    const { searchParams } = new URL(req.url)
    const step = searchParams.get("step") || "initial"
    const fid = searchParams.get("fid")
    const error = searchParams.get("error")

    // Определяем содержимое изображения в зависимости от шага
    let title = "Mini App"
    let subtitle = "Добро пожаловать!"
    const bgColor = "black"
    let textColor = "#ffffff"

    if (error) {
      title = "Произошла ошибка"
      subtitle = "Пожалуйста, попробуйте снова"
      textColor = "#ffffff"
    } else if (step === "welcome") {
      title = "Mini App"
      subtitle = fid ? `Пользователь FID: ${fid}` : "Нажмите 'Продолжить'"
      textColor = "#ffffff"
    } else if (step === "final") {
      title = "Mini App"
      subtitle = "Вы успешно взаимодействовали с фреймом"
      textColor = "#ffffff"
    }

    // Генерируем изображение
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: bgColor,
          color: textColor,
          padding: "40px",
          textAlign: "center",
          fontFamily: "monospace",
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/back%20piggy-S1VvX0NIdbuCNYv8cCxUlCUdlPgQDA.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            border: `2px solid ${textColor}`,
            borderRadius: "12px",
            boxShadow: `0 0 10px ${textColor}`,
          }}
        >
          <h1
            style={{
              fontSize: 60,
              fontWeight: "bold",
              margin: "0 0 20px",
              textShadow: `0 0 5px ${textColor}, 0 0 10px ${textColor}`,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 30, margin: 0, textShadow: `0 0 3px ${textColor}` }}>{subtitle}</p>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error("Error generating image:", error)

    // В случае ошибки возвращаем простое изображение с сообщением об ошибке
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          color: "#ffffff",
          padding: "40px",
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        <h1
          style={{
            fontSize: 60,
            fontWeight: "bold",
            margin: "0 0 20px",
            textShadow: "0 0 5px #ffffff, 0 0 10px #ffffff",
          }}
        >
          Ошибка
        </h1>
        <p style={{ fontSize: 30, margin: 0, textShadow: "0 0 3px #ffffff" }}>Не удалось сгенерировать изображение</p>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  }
}
