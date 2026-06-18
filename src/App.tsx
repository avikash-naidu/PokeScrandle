import { useState } from "react";
import PokemonCard from "./components/PokemonCard";
import ResultBanner from "./components/ResultBanner";
import { getDailyMatchups } from "./data/pokemon";
import { getStats, recordResult } from "./lib/supabase";
import type { StatsState, DailyProgress, Matchup } from "./types";
import "./App.css";
import { initProgress, loadProgress, saveProgress } from "./lib/storage";
import RoundTracker from "./components/RoundTracker";
import DailySummary from "./components/DailySummary";

export default function App() {
  // ── State ────────────────────────────────────────────────
  const [winningSide, setWinningSide] = useState<"left" | "right" | null>(null);
  const [matchups] = useState<Matchup[]>(getDailyMatchups);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [progress, setProgress] = useState<DailyProgress>(
    () => loadProgress() ?? initProgress(),
  );
  const [stats, setStats] = useState<StatsState>({ left: null, right: null });
  const [revealing, setRevealing] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(
  () => progress.completed  // auto-show on load if already completed today
)
  // ── Derived values ───────────────────────────────────────
  const currentMatchup = matchups[currentRound];
  const currentResult = progress.results[currentRound];
  const winningPokemon = winningSide ? currentMatchup[winningSide] : null;
  const bannerCorrect = currentResult === "correct";
  const bannerMessage = winningPokemon
    ? bannerCorrect
      ? `✅ Correct! ${winningPokemon.reason}`
      : `❌ Wrong! ${winningPokemon.name} scores higher. ${winningPokemon.reason}`
    : "";
 // ── Methods ────────────────────────────────────────────
  async function guess(side: "left" | "right"): Promise<void> {
    if (revealing || progress.completed) return;
    const matchup = matchups[currentRound];
    const winner = side === "left" ? matchup.left : matchup.right;
    const loser = side === "left" ? matchup.right : matchup.left;
    try {
      await recordResult(winner.id, loser.id);
    } catch (e) {
      console.warn("recordResult failed:", e);
    }

    const [winnerStats, loserStats] = await Promise.all([
      getStats(winner.id),
      getStats(loser.id),
    ]);

    const correct =
      winnerStats.votes / winnerStats.appearances >=
      loserStats.votes / loserStats.appearances;

    if (correct) {
      setWinningSide(side);
    } else {
      setWinningSide(side === "left" ? "right" : "left");
    }

    setStats(
      side === "left"
        ? { left: winnerStats, right: loserStats }
        : { left: loserStats, right: winnerStats },
    );

    setRevealing(true);

    // Save this round's result
    const newResults = [...progress.results];
    newResults[currentRound] = correct ? "correct" : "incorrect";
    const isLastRound = currentRound === 9;
    const newProgress: DailyProgress = {
      ...progress,
      results: newResults,
      completed: isLastRound,
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    // Advance after showing the reveal
    setTimeout(() => {
      if (isLastRound) {
        // stay on last round, completed state shows summary
      } else {
        setCurrentRound((r) => r + 1);
        setStats({ left: null, right: null });
      }
      setRevealing(false);
    }, 2200);
  }

  function isWinner(side: "left" | "right"): boolean {
    if (!winningSide) return false;
    return side === winningSide;
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      <header className="app-header">
        <h1>Would you rather eat?</h1>
        <p>Pick the more popular choice — 10 matchups, new set every day.</p>
      </header>

      <RoundTracker results={progress.results} currentRound={currentRound} />

      {!progress.completed && (
        <>
          <div className="arena">
            <PokemonCard
              pokemon={matchups[currentRound].left}
              phase={revealing ? "reveal" : "playing"}
              isWinner={isWinner("left")}
              stats={stats.left}
              onGuess={() => guess("left")}
            />
            <div className="vs">VS</div>
            <PokemonCard
              pokemon={matchups[currentRound].right}
              phase={revealing ? "reveal" : "playing"}
              isWinner={isWinner("right")}
              stats={stats.right}
              onGuess={() => guess("right")}
            />
          </div>
          <ResultBanner
            correct={bannerCorrect}
            message={bannerMessage}
            visible={revealing}
          />
        </>
      )}

      {/* Show the "View Results" button when completed but summary is closed */}
    {progress.completed && !showSummary && (
      <button className="view-results-btn" onClick={() => setShowSummary(true)}>
        View today's results
      </button>
    )}

    {showSummary && (
      <DailySummary
        progress={progress}
        matchups={matchups}
        onClose={() => setShowSummary(false)}
      />
    )}
    
    </>
  );
}
