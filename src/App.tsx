import { useState, useCallback } from 'react'
import PokemonCard  from './components/PokemonCard'
import ResultBanner from './components/ResultBanner'
import GameOver     from './components/GameOver'
import { randomPokemon } from './data/pokemon'
import { getStats, recordResult } from './lib/supabase'
import type { GamePhase, RoundState, StatsState, GuessResult } from './types'
import './App.css'

function initRound(): RoundState {
  const left  = randomPokemon()
  const right = randomPokemon(left)
  return { left, right }
}

export default function App() {
  const [{ left, right }, setPokemons] = useState<RoundState>(initRound)
  const [streak,  setStreak]  = useState<number>(0)
  const [phase,   setPhase]   = useState<GamePhase>('playing')
  const [result,  setResult]  = useState<GuessResult | null>(null)
  
  const [stats,   setStats]   = useState<StatsState>({ left: null, right: null })
  const [picked,  setPicked]  = useState<'left' | 'right' | null>(null)

  const guess = useCallback(async (side: 'left' | 'right'): Promise<void> => {
    if (phase !== 'playing') return

    setPhase('reveal')
    setPicked(side)

    const winner  = side === 'left' ? left  : right
    const loser   = side === 'left' ? right : left
    const correct = winner.eatScore >= loser.eatScore

    try {
      await recordResult(winner.id, loser.id)
    } catch (e) {
      console.warn('recordResult failed:', e)
    }
    
    const [winnerStats, loserStats] = await Promise.all([
      getStats(winner.id),
      getStats(loser.id),
    ])

    setStats(
      side === 'left'
        ? { left: winnerStats, right: loserStats }
        : { left: loserStats, right: winnerStats },
    )

    setResult({
      correct,
      message: correct
        ? `✅ Correct! ${winner.reason}`
        : `❌ Wrong! ${loser.name} scores higher. ${loser.reason}`,
    })

    setTimeout(() => {
      if (correct) {
        setStreak((s) => s + 1)
        setPokemons((prev) => {
          const keep = side === 'left' ? prev.left : prev.right
          const next = randomPokemon(keep)
          return side === 'left'
            ? { left: keep, right: next }
            : { left: next, right: keep }
        })
        setStats({ left: null, right: null })
        setPicked(null)
        setResult(null)
        setPhase('playing')
      } else {
        setPhase('gameover')
      }
    }, 2400)
  }, [phase, left, right])

  function resetGame(): void {
    setPokemons(initRound())
    setStreak(0)
    setPhase('playing')
    setResult(null)
    setStats({ left: null, right: null })
    setPicked(null)
  }

  function isWinner(side: 'left' | 'right'): boolean {
    if (!result) return false
    return result.correct ? side === picked : side !== picked
  }

  // During gameover we freeze the cards in their reveal state
  const cardPhase: GamePhase = phase === 'gameover' ? 'reveal' : phase

  return (
    <>
      <header className="app-header">
        <h1>Would you rather eat?</h1>
        <p>Pick the Pokémon more people would eat. One wrong guess ends your streak.</p>
      </header>

      <div className="streak-bar">
        <span>streak</span>
        <span className="streak-num">{streak}</span>
      </div>

      <div className="arena">
        <PokemonCard
          pokemon={left}
          phase={cardPhase}
          isWinner={isWinner('left')}
          stats={stats.left}
          onGuess={() => guess('left')}
        />

        <div className="vs">VS</div>

        <PokemonCard
          pokemon={right}
          phase={cardPhase}
          isWinner={isWinner('right')}
          stats={stats.right}
          onGuess={() => guess('right')}
        />
      </div>

      <ResultBanner
        correct={result?.correct ?? false}
        message={result?.message ?? ''}
        visible={result !== null}
      />

      {phase === 'gameover' && (
        <GameOver streak={streak} onReset={resetGame} />
      )}
    </>
  )
}
