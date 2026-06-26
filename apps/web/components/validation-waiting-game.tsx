"use client"

import { useCallback, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { FlappyBirdGame } from "@/components/flappy-bird-game"

type Props = {
  active: boolean
}

export const ValidationWaitingGame = ({ active }: Props) => {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const handleScoreChange = useCallback((nextScore: number, nextHighScore: number) => {
    setScore(nextScore)
    setHighScore(nextHighScore)
  }, [])

  return (
    <Card className="rounded-sm shadow-none ring-1 ring-[#e7e7e8]">
      <CardHeader>
        <CardTitle className="text-lg">Ventetid? Byg videre!</CardTitle>
        <CardDescription>
          Validér din refleks mens vi krydstjekker mod Molio-kilder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FlappyBirdGame active={active} onScoreChange={handleScoreChange} />
      </CardContent>
      <CardFooter className="justify-between text-sm">
        <span className="text-muted-foreground">
          Klik eller tryk mellemrum for at hoppe
        </span>
        <span className="font-medium tabular-nums">
          Score: {score}
          {highScore > 0 && (
            <span className="text-muted-foreground font-normal">
              {" "}
              · Bedste: {highScore}
            </span>
          )}
        </span>
      </CardFooter>
    </Card>
  )
}
