export function ImageGrid() {
  return (
    <div className="w-full h-full relative">
      {/* Casino */}
      <div className="absolute" style={{ left: "276px", top: "72px" }}>
        <img
          src="/images/casino.png"
          alt="Casino"
          style={{ width: "120px", height: "120px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Superform Area */}
      <div className="absolute" style={{ left: "280px", top: "314px" }}>
        <img
          src="/images/superformarea.png"
          alt="Superform Area"
          style={{ width: "120px", height: "120px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Oink Oink */}
      <div className="absolute" style={{ left: "23px", top: "364px" }}>
        <img
          src="/images/oink-oink.png"
          alt="Oink Oink"
          style={{ width: "108px", height: "108px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Piggy AI */}
      <div className="absolute" style={{ left: "23px", top: "82px" }}>
        <img
          src="/images/piggy-ai.png"
          alt="Piggy AI"
          style={{ width: "120px", height: "120px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Game Zone */}
      <div className="absolute" style={{ left: "281px", top: "528px" }}>
        <img
          src="/images/game-zone.png"
          alt="Game Zone"
          style={{ width: "144px", height: "144px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Piggy Bank */}
      <div className="absolute" style={{ left: "148px", top: "244px" }}>
        <img
          src="/images/piggy-bank.png"
          alt="Piggy Bank"
          style={{ width: "138px", height: "138px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Piggy Dao - новая локация ниже Piggy Bank */}
      <div className="absolute" style={{ left: "148px", top: "390px" }}>
        <img
          src="/images/piggy-dao-icon.png"
          alt="Piggy Dao"
          style={{ width: "138px", height: "138px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* PNN */}
      <div className="absolute" style={{ left: "43px", top: "563px" }}>
        <img
          src="/images/pnn.png"
          alt="PNN"
          style={{ width: "120px", height: "120px" }}
          className="object-contain hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
  )
}
