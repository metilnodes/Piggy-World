export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundImage: "url('/background-grid.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center bg-black bg-opacity-70 p-8 rounded-lg border border-white shadow-lg backdrop-blur-sm">
        <div className="w-16 h-16 mb-4 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-white">Loading...</h2>
      </div>
    </div>
  )
}
