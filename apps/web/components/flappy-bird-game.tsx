"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

import { createFlappyBirdSounds } from "@/lib/flappy-bird-sounds"
import {
  DEFAULT_FLAPPY_BIRD_SKIN,
  FLAPPY_BIRD_SKINS,
  FLAPPY_BIRD_SKIN_OPTIONS,
  getStoredSkin,
  setStoredSkin,
  type FlappyBirdSkinId,
} from "@/lib/flappy-bird-skins"

type GameState = "idle" | "playing" | "dead"

type FallingHat = {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
}

type Props = {
  active: boolean
  className?: string
  onScoreChange?: (score: number, highScore: number) => void
}

type Pipe = {
  x: number
  gapY: number
  passed: boolean
}

const HIGH_SCORE_KEY = "molio-flappy-high-score"

const GRAVITY = 0.45
const FLAP_VELOCITY = -7.5
const PIPE_SPEED = 2.5
const PIPE_WIDTH = 52
const PIPE_GAP = 120
const PIPE_SPAWN_INTERVAL = 1800
const BIRD_SIZE = 28
const GROUND_HEIGHT = 48
const CEILING = 0
const STARTING_LIVES = 2
const INVINCIBILITY_MS = 1500

const getHighScore = () => {
  if (typeof window === "undefined") return 0
  const stored = sessionStorage.getItem(HIGH_SCORE_KEY)
  return stored ? Number.parseInt(stored, 10) : 0
}

const setHighScore = (score: number) => {
  sessionStorage.setItem(HIGH_SCORE_KEY, String(score))
}

export const FlappyBirdGame = ({ active, className, onScoreChange }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const onScoreChangeRef = useRef(onScoreChange)
  const soundsRef = useRef(createFlappyBirdSounds())
  const skinRef = useRef<FlappyBirdSkinId>(DEFAULT_FLAPPY_BIRD_SKIN)
  const gameRef = useRef({
    state: "idle" as GameState,
    birdY: 0,
    birdVelocity: 0,
    wingFrame: 0,
    pipes: [] as Pipe[],
    score: 0,
    highScore: 0,
    lastPipeSpawn: 0,
    lastFrameTime: 0,
    lives: STARTING_LIVES,
    hasHat: true,
    fallingHat: null as FallingHat | null,
    invincibleUntil: 0,
  })
  const [displayScore, setDisplayScore] = useState(0)
  const [displayHighScore, setDisplayHighScore] = useState(0)
  const [selectedSkin, setSelectedSkin] = useState<FlappyBirdSkinId>(DEFAULT_FLAPPY_BIRD_SKIN)
  const [canPickSkin, setCanPickSkin] = useState(true)

  useEffect(() => {
    onScoreChangeRef.current = onScoreChange
  }, [onScoreChange])

  useEffect(() => {
    const sounds = soundsRef.current
    return () => {
      sounds.dispose()
    }
  }, [])

  const resetGame = useCallback((height: number) => {
    const game = gameRef.current
    game.state = "idle"
    game.birdY = height / 2 - GROUND_HEIGHT
    game.birdVelocity = 0
    game.wingFrame = 0
    game.pipes = []
    game.score = 0
    game.lastPipeSpawn = 0
    game.lives = STARTING_LIVES
    game.hasHat = true
    game.fallingHat = null
    game.invincibleUntil = 0
    setDisplayScore(0)
    setCanPickSkin(true)
    onScoreChangeRef.current?.(0, game.highScore)
  }, [])

  const flap = useCallback(() => {
    soundsRef.current.unlock()

    const game = gameRef.current
    if (game.state === "idle") {
      game.state = "playing"
      game.birdVelocity = FLAP_VELOCITY
      setCanPickSkin(false)
      soundsRef.current.playFlap()
      return
    }
    if (game.state === "dead") {
      const canvas = canvasRef.current
      if (canvas) resetGame(canvas.height / (window.devicePixelRatio || 1))
      setCanPickSkin(true)
      return
    }
    if (game.state === "playing") {
      game.birdVelocity = FLAP_VELOCITY
      soundsRef.current.playFlap()
    }
  }, [resetGame])

  useEffect(() => {
    gameRef.current.highScore = getHighScore()
    setDisplayHighScore(gameRef.current.highScore)

    const storedSkin = getStoredSkin()
    skinRef.current = storedSkin
    setSelectedSkin(storedSkin)
  }, [])

  const handleSkinChange = useCallback((skinId: FlappyBirdSkinId) => {
    if (gameRef.current.state === "playing") return

    skinRef.current = skinId
    setSelectedSkin(skinId)
    setStoredSkin(skinId)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = container.clientWidth
      const height = Math.round(width * 0.75)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      resetGame(height)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [resetGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return
      if (document.activeElement !== canvas) return
      event.preventDefault()
      flap()
    }

    canvas.addEventListener("keydown", handleKeyDown)
    return () => canvas.removeEventListener("keydown", handleKeyDown)
  }, [flap])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId = 0

    const drawSky = (width: number, height: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height - GROUND_HEIGHT)
      gradient.addColorStop(0, "#bae6fd")
      gradient.addColorStop(1, "#e0f2fe")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)
    }

    const drawGround = (width: number, height: number) => {
      const groundY = height - GROUND_HEIGHT
      ctx.fillStyle = "#ca8a04"
      ctx.fillRect(0, groundY, width, GROUND_HEIGHT)

      ctx.fillStyle = "#a16207"
      for (let x = 0; x < width; x += 16) {
        ctx.fillRect(x, groundY + 8, 8, 4)
        ctx.fillRect(x + 8, groundY + 20, 8, 4)
        ctx.fillRect(x + 4, groundY + 32, 8, 4)
      }

      ctx.strokeStyle = "#713f12"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(width, groundY)
      ctx.stroke()
    }

    const drawPipe = (x: number, gapY: number, height: number) => {
      const pipeColor = "#94a3b8"
      const capColor = "#64748b"
      const groundY = height - GROUND_HEIGHT

      const drawColumn = (top: number, columnHeight: number) => {
        ctx.fillStyle = pipeColor
        ctx.fillRect(x, top, PIPE_WIDTH, columnHeight)
        ctx.fillStyle = capColor
        const capHeight = 14
        ctx.fillRect(x - 4, top + (top === 0 ? columnHeight - capHeight : 0), PIPE_WIDTH + 8, capHeight)
        ctx.strokeStyle = "#cbd5e1"
        ctx.lineWidth = 1
        ctx.strokeRect(x, top, PIPE_WIDTH, columnHeight)
      }

      drawColumn(CEILING, gapY - PIPE_GAP / 2)
      drawColumn(gapY + PIPE_GAP / 2, groundY - (gapY + PIPE_GAP / 2))
    }

    const drawFallingHat = (hat: FallingHat, height: number, skinId: FlappyBirdSkinId) => {
      const skin = FLAPPY_BIRD_SKINS[skinId]
      const groundY = height - GROUND_HEIGHT

      ctx.save()
      ctx.translate(hat.x, hat.y)
      ctx.rotate(hat.rotation)
      skin.drawHeadwear(ctx)
      ctx.restore()

      if (hat.y > groundY - 8) {
        ctx.save()
        ctx.translate(hat.x, groundY - 6)
        ctx.rotate(hat.rotation * 0.4)
        ctx.globalAlpha = 0.85
        skin.drawHeadwear(ctx, skin.fallenHeadwearColor)
        ctx.restore()
      }
    }

    const drawBird = (
      x: number,
      y: number,
      wingFrame: number,
      hasHat: boolean,
      blink: boolean,
      skinId: FlappyBirdSkinId,
    ) => {
      if (blink) return

      ctx.save()
      ctx.translate(x, y)
      FLAPPY_BIRD_SKINS[skinId].drawBird(ctx, wingFrame, hasHat)
      ctx.restore()
    }

    const drawLives = (lives: number, skinId: FlappyBirdSkinId) => {
      const skin = FLAPPY_BIRD_SKINS[skinId]

      for (let index = 0; index < STARTING_LIVES; index += 1) {
        const alive = index < lives
        const x = 14 + index * 18
        const y = 14

        ctx.save()
        ctx.translate(x, y)
        skin.drawLifeIcon(ctx, alive)
        ctx.restore()
      }
    }

    const drawOverlay = (width: number, height: number, text: string, subtext?: string) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)"
      ctx.fillRect(0, 0, width, height - GROUND_HEIGHT)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 18px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(text, width / 2, height / 2 - 10)

      if (subtext) {
        ctx.font = "13px system-ui, sans-serif"
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
        ctx.fillText(subtext, width / 2, height / 2 + 16)
      }
    }

    const drawBadge = (width: number) => {
      ctx.fillStyle = "rgba(0,0,0,0.08)"
      ctx.beginPath()
      ctx.roundRect(width - 58, 8, 50, 20, 4)
      ctx.fill()
      ctx.fillStyle = "#475569"
      ctx.font = "10px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Molio", width - 33, 22)
    }

    const checkCollision = (
      birdX: number,
      birdY: number,
      pipes: Pipe[],
      height: number,
    ) => {
      const groundY = height - GROUND_HEIGHT
      const birdLeft = birdX - BIRD_SIZE / 2 + 4
      const birdRight = birdX + BIRD_SIZE / 2 - 4
      const birdTop = birdY - BIRD_SIZE / 2 + 4
      const birdBottom = birdY + BIRD_SIZE / 2 - 4

      if (birdTop <= CEILING || birdBottom >= groundY) return true

      for (const pipe of pipes) {
        const pipeLeft = pipe.x
        const pipeRight = pipe.x + PIPE_WIDTH
        const gapTop = pipe.gapY - PIPE_GAP / 2
        const gapBottom = pipe.gapY + PIPE_GAP / 2

        const horizontalOverlap = birdRight > pipeLeft && birdLeft < pipeRight
        if (!horizontalOverlap) continue

        if (birdTop < gapTop || birdBottom > gapBottom) return true
      }

      return false
    }

    const spawnPipe = (width: number, height: number) => {
      const minGap = PIPE_GAP + 40
      const maxGap = height - GROUND_HEIGHT - PIPE_GAP - 40
      const gapY = minGap + Math.random() * (maxGap - minGap)
      gameRef.current.pipes.push({ x: width, gapY, passed: false })
    }

    const loseLife = (birdX: number, height: number, timestamp: number) => {
      const game = gameRef.current

      game.lives -= 1
      game.hasHat = false
      game.fallingHat = {
        x: birdX,
        y: game.birdY - 18,
        vx: -2,
        vy: -4,
        rotation: -0.4,
        rotationSpeed: 0.12,
      }
      game.birdY = height / 2 - GROUND_HEIGHT / 2
      game.birdVelocity = FLAP_VELOCITY
      game.invincibleUntil = timestamp + INVINCIBILITY_MS
      soundsRef.current.playLoseLife()
    }

    const tick = (timestamp: number) => {
      const game = gameRef.current
      const skinId = skinRef.current
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      const birdX = width * 0.28

      if (game.lastFrameTime === 0) game.lastFrameTime = timestamp
      const delta = Math.min(timestamp - game.lastFrameTime, 32)
      game.lastFrameTime = timestamp

      if (game.state === "playing") {
        game.birdVelocity += GRAVITY * (delta / 16)
        game.birdY += game.birdVelocity * (delta / 16)
        game.wingFrame += delta / 16

        if (game.fallingHat) {
          const hat = game.fallingHat
          hat.x += hat.vx * (delta / 16)
          hat.y += hat.vy * (delta / 16)
          hat.vy += GRAVITY * 0.6 * (delta / 16)
          hat.rotation += hat.rotationSpeed * (delta / 16)

          const groundY = height - GROUND_HEIGHT
          if (hat.y >= groundY - 8) {
            hat.y = groundY - 8
            hat.vy = 0
            hat.vx *= 0.92
            hat.rotationSpeed *= 0.9
          }

          if (hat.x < -40) {
            game.fallingHat = null
          }
        }

        if (timestamp - game.lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
          spawnPipe(width, height)
          game.lastPipeSpawn = timestamp
        }

        game.pipes = game.pipes
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED * (delta / 16) }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH)

        for (const pipe of game.pipes) {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
            pipe.passed = true
            game.score += 1
            setDisplayScore(game.score)
            soundsRef.current.playScore()
            if (game.score > game.highScore) {
              game.highScore = game.score
              setHighScore(game.highScore)
              setDisplayHighScore(game.highScore)
            }
            onScoreChangeRef.current?.(game.score, game.highScore)
          }
        }

        if (
          timestamp >= game.invincibleUntil &&
          checkCollision(birdX, game.birdY, game.pipes, height)
        ) {
          if (game.lives > 1) {
            loseLife(birdX, height, timestamp)
          } else {
            game.state = "dead"
            soundsRef.current.playGameOver()
            setCanPickSkin(true)
          }
        }
      } else if (game.fallingHat) {
        const hat = game.fallingHat
        hat.x += hat.vx * (delta / 16)
        hat.y += hat.vy * (delta / 16)
        hat.vy += GRAVITY * 0.6 * (delta / 16)
        hat.rotation += hat.rotationSpeed * (delta / 16)

        if (hat.y > height + 20) {
          game.fallingHat = null
        }
      }

      drawSky(width, height)
      drawBadge(width)

      for (const pipe of game.pipes) {
        drawPipe(pipe.x, pipe.gapY, height)
      }

      drawGround(width, height)

      if (game.fallingHat) {
        drawFallingHat(game.fallingHat, height, skinId)
      }

      const isInvincible = game.state === "playing" && timestamp < game.invincibleUntil
      const blink = isInvincible && Math.floor(timestamp / 100) % 2 === 0
      drawBird(birdX, game.birdY, game.wingFrame, game.hasHat, blink, skinId)
      drawLives(game.lives, skinId)

      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 22px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(String(game.score), width / 2, 36)

      if (game.state === "idle") {
        drawOverlay(width, height, "Klik for at starte", "Byg dig gennem kolonnerne")
      } else if (game.state === "dead") {
        const gameOverSubtext =
          skinId === "pirate"
            ? "Hatten er over bord — klik for at prøve igen"
            : "Hatten er væk — klik for at prøve igen"
        drawOverlay(width, height, "Game over", gameOverSubtext)
      }

      animationId = requestAnimationFrame(tick)
    }

    animationId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationId)
      gameRef.current.lastFrameTime = 0
    }
  }, [active])

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Vælg fugleskin"
      >
        <span className="text-muted-foreground text-xs font-medium">Skin:</span>
        {FLAPPY_BIRD_SKIN_OPTIONS.map((skin) => (
          <Button
            key={skin.id}
            type="button"
            size="xs"
            variant={selectedSkin === skin.id ? "default" : "outline"}
            disabled={!canPickSkin}
            aria-pressed={selectedSkin === skin.id}
            onClick={() => handleSkinChange(skin.id)}
          >
            {skin.label}
          </Button>
        ))}
      </div>
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Flappy Bird minispil. Skin: ${FLAPPY_BIRD_SKINS[selectedSkin].label}. Score: ${displayScore}. Bedste score: ${displayHighScore}.`}
          tabIndex={0}
          className="cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={flap}
          onTouchStart={(event) => {
            event.preventDefault()
            flap()
          }}
        />
      </div>
    </div>
  )
}
