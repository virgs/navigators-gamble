import { AiAlgorithmType } from '../../ai/algorithms/ai-algorithm-type'
import { GameConfiguration, GamePlayerConfiguration } from '../game-configuration/game-configuration'
import { PlayerType } from '../game-configuration/player-type'
import { GameEngine } from '../game-engine'

export class LevelEvaluator {
    private readonly gameConfig: GameConfiguration
    private readonly aiHumanPlayerId: string
    private readonly parallelExecutions: number

    public constructor(gameConfig: GameConfiguration, humanLevel: number = 300, parallelExecutions: number = 3) {
        this.gameConfig = gameConfig
        this.parallelExecutions = parallelExecutions
        const ai = this.gameConfig.players.find((p) => p.type === PlayerType.ARTIFICIAL_INTELLIGENCE)!
        const humanPlayer = this.gameConfig.players.find((p) => p.type === PlayerType.HUMAN)
        const aiHuman: GamePlayerConfiguration = {
            id: humanPlayer?.id ?? 'human-player',
            type: PlayerType.ARTIFICIAL_INTELLIGENCE,
            aiAlgorithm: AiAlgorithmType.PURE_MONTE_CARLO_TREE_SEARCH,
            iterationsPerAlternative: humanLevel,
        }

        this.gameConfig.players = [aiHuman, ai]
        this.aiHumanPlayerId = aiHuman.id
    }

    public async evalue(iterations: number = 100): Promise<number> {
        const startTime = performance.now()
        console.log(`Starting evaluation with ${iterations} iterations`)
        const promises = []
        for (let i = 0; i < this.parallelExecutions; i++) {
            promises.push(this.evaluateLevel(Math.ceil(iterations / this.parallelExecutions)))
        }
        const results = await Promise.all(promises)
        const endTime = performance.now()
        console.log(`Evaluation took ${Math.round(endTime - startTime)} ms`)
        return results.reduce((a, b) => a + b, 0) / iterations
    }

    private async evaluateLevel(iterations: number): Promise<number> {
        let losses = 0
        for (let i = 0; i < iterations; i++) {
            console.log(`Iteration ${i + 1} of ${iterations}`)
            const gameEngine = new GameEngine(this.gameConfig)
            gameEngine.start()
            while (!gameEngine.isGameOver()) {
                await gameEngine.playNextRound()
            }
            gameEngine.calculateEndGameBonusPoints()
            gameEngine.finish()
            const finalScore = gameEngine.getScores()
            losses +=
                finalScore[this.aiHumanPlayerId] <
                Object.keys(finalScore)
                    .filter((k) => k !== this.aiHumanPlayerId)
                    .map((k) => finalScore[k])
                    .reduce((a, b) => a + b, 0)
                    ? 1
                    : 0
        }
        return losses
    }
}
