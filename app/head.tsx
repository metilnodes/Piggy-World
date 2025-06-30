export default function Head() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.piggyworld.xyz"

  const embedPayload = {
    version: "next",
    imageUrl: `${BASE_URL}/imageUrl.png`,
    button: {
      title: "Enter OINK World",
      action: {
        type: "launch_frame",
        url: BASE_URL,
        splashImageUrl: `${BASE_URL}/icon.png`,
        splashBackgroundColor: "#000000",
      },
    },
  }

  return (
    <>
      <meta charSet="utf-8" />
      <title>OINK World</title>
      <meta name="description" content="Interactive OINK ecosystem with 7 unique locations" />

      {/* Единственный мета-тег fc:frame с JSON */}
      <meta name="fc:frame" content={JSON.stringify(embedPayload)} />

      {/* Open Graph теги для превью */}
      <meta property="og:title" content="Piggy World" />
      <meta property="og:description" content="Interactive Piggy ecosystem" />
      <meta property="og:image" content={`${BASE_URL}/imageUrl.png`} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Piggy World" />
      <meta name="twitter:description" content="Interactive Piggy ecosystem" />
      <meta name="twitter:image" content={`${BASE_URL}/imageUrl.png`} />
    </>
  )
}
