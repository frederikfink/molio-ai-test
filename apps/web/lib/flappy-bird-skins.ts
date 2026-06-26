export type FlappyBirdSkinId = "builder" | "pirate"

export type FlappyBirdSkin = {
  id: FlappyBirdSkinId
  label: string
  drawHeadwear: (ctx: CanvasRenderingContext2D, color?: string) => void
  drawBird: (
    ctx: CanvasRenderingContext2D,
    wingFrame: number,
    hasHeadwear: boolean,
  ) => void
  drawLifeIcon: (ctx: CanvasRenderingContext2D, alive: boolean) => void
  fallenHeadwearColor: string
}

const drawBuilderHeadwear = (ctx: CanvasRenderingContext2D, color = "#eab308") => {
  ctx.fillStyle = color
  ctx.fillRect(-12, -16, 24, 8)
  ctx.fillRect(-8, -22, 16, 8)
}

const drawPirateHeadwear = (ctx: CanvasRenderingContext2D, color = "#1e293b") => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-14, -12)
  ctx.lineTo(0, -24)
  ctx.lineTo(14, -12)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = "#ca8a04"
  ctx.fillRect(-10, -14, 20, 3)

  ctx.fillStyle = "#f8fafc"
  ctx.beginPath()
  ctx.arc(4, -18, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#1e293b"
  ctx.beginPath()
  ctx.arc(4.5, -18.5, 1, 0, Math.PI * 2)
  ctx.fill()
}

const drawBuilderBird = (
  ctx: CanvasRenderingContext2D,
  wingFrame: number,
  hasHeadwear: boolean,
) => {
  const wingOffset = Math.sin(wingFrame * 0.3) * 4

  ctx.fillStyle = "#f59e0b"
  ctx.beginPath()
  ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  if (hasHeadwear) {
    drawBuilderHeadwear(ctx)
  }

  ctx.fillStyle = "#fef3c7"
  ctx.beginPath()
  ctx.ellipse(-6, 0 + wingOffset, 8, 5, -0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#1e293b"
  ctx.beginPath()
  ctx.arc(6, -2, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#f97316"
  ctx.beginPath()
  ctx.moveTo(10, 0)
  ctx.lineTo(18, 2)
  ctx.lineTo(10, 4)
  ctx.closePath()
  ctx.fill()
}

const drawPirateBird = (
  ctx: CanvasRenderingContext2D,
  wingFrame: number,
  hasHeadwear: boolean,
) => {
  const wingOffset = Math.sin(wingFrame * 0.3) * 4

  ctx.fillStyle = "#16a34a"
  ctx.beginPath()
  ctx.ellipse(0, 2, 14, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  if (hasHeadwear) {
    drawPirateHeadwear(ctx)
  }

  ctx.fillStyle = "#ef4444"
  ctx.beginPath()
  ctx.ellipse(-6, 0 + wingOffset, 8, 5, -0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#1e293b"
  ctx.beginPath()
  ctx.arc(6, -2, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#0f172a"
  ctx.beginPath()
  ctx.ellipse(6, -2, 4, 3.2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = "#ca8a04"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(2, -2)
  ctx.lineTo(10, -2)
  ctx.stroke()

  ctx.fillStyle = "#fbbf24"
  ctx.beginPath()
  ctx.moveTo(10, 0)
  ctx.lineTo(18, 2)
  ctx.lineTo(10, 4)
  ctx.closePath()
  ctx.fill()
}

const drawBuilderLifeIcon = (ctx: CanvasRenderingContext2D, alive: boolean) => {
  ctx.globalAlpha = alive ? 1 : 0.25
  ctx.fillStyle = alive ? "#eab308" : "#94a3b8"
  ctx.fillRect(-6, -2, 12, 4)
  ctx.fillRect(-4, -6, 8, 4)
}

const drawPirateLifeIcon = (ctx: CanvasRenderingContext2D, alive: boolean) => {
  ctx.globalAlpha = alive ? 1 : 0.25
  drawPirateHeadwear(ctx, alive ? "#1e293b" : "#94a3b8")
}

export const FLAPPY_BIRD_SKINS: Record<FlappyBirdSkinId, FlappyBirdSkin> = {
  builder: {
    id: "builder",
    label: "Bygmester",
    drawHeadwear: drawBuilderHeadwear,
    drawBird: drawBuilderBird,
    drawLifeIcon: drawBuilderLifeIcon,
    fallenHeadwearColor: "#ca8a04",
  },
  pirate: {
    id: "pirate",
    label: "Pirat",
    drawHeadwear: drawPirateHeadwear,
    drawBird: drawPirateBird,
    drawLifeIcon: drawPirateLifeIcon,
    fallenHeadwearColor: "#334155",
  },
}

export const FLAPPY_BIRD_SKIN_OPTIONS = Object.values(FLAPPY_BIRD_SKINS)

export const DEFAULT_FLAPPY_BIRD_SKIN: FlappyBirdSkinId = "builder"

export const SKIN_STORAGE_KEY = "molio-flappy-skin"

export const getStoredSkin = (): FlappyBirdSkinId => {
  if (typeof window === "undefined") return DEFAULT_FLAPPY_BIRD_SKIN

  const stored = sessionStorage.getItem(SKIN_STORAGE_KEY)
  if (stored && stored in FLAPPY_BIRD_SKINS) {
    return stored as FlappyBirdSkinId
  }

  return DEFAULT_FLAPPY_BIRD_SKIN
}

export const setStoredSkin = (skinId: FlappyBirdSkinId) => {
  sessionStorage.setItem(SKIN_STORAGE_KEY, skinId)
}
