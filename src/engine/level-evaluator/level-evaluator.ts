import { AiAlgorithmType } from '../../ai/algorithms/ai-algorithm-type'
import { sleep } from '../../math/sleep'
import { GameConfiguration, GamePlayerConfiguration } from '../game-configuration/game-configuration'
import { PlayerType } from '../game-configuration/player-type'
import { GameEngine } from '../game-engine'

export class LevelEvaluator {
    private readonly gameConfig: GameConfiguration
    private readonly aiHumanPlayerId: string
    private readonly parallelExecutions: number
    private remainingIterations: number
    private evaluated: boolean
    private terminating: boolean
    private readonly onUpdate?: (value: number, remainingIterations: number) => void

    public constructor(
        gameConfig: GameConfiguration,
        humanLevel: number = 300,
        parallelExecutions: number = 3,
        onUpdate?: (value: number, remainingIterations: number) => void
    ) {
        this.remainingIterations = 0
        this.onUpdate = onUpdate
        this.evaluated = false
        this.terminating = false

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

    public async terminate(): Promise<void> {
        this.terminating = true
        console.log('Terminating level evaluator')
        while (!this.evaluated) {
            await sleep(50)
        }
        console.log('Level evaluator terminated')
    }

    public terminated(): boolean {
        return this.terminating
    }

    public async evaluate(iterations: number = 100): Promise<number> {
        this.remainingIterations = iterations
        this.evaluated = false
        this.terminating = false
        const startTime = performance.now()
        console.log(
            `Starting evaluation with ${iterations} iterations in ${this.parallelExecutions} parallel executions`
        )
        const promises = []
        for (let i = 0; i < this.parallelExecutions && !this.terminating; i++) {
            promises.push(this.evaluateLevel(Math.ceil(iterations / this.parallelExecutions)))
        }
        const results = await Promise.all(promises)
        const endTime = performance.now()
        const result = results.reduce((a, b) => a + b, 0) / iterations
        console.log(`Evaluation took ${Math.round(endTime - startTime)} ms. ${result} losses average.`)
        this.evaluated = true
        return result
    }

    private async evaluateLevel(iterations: number): Promise<number> {
        let losses = 0
        for (let i = 0; i < iterations && !this.terminating; i++) {
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
            if (this.onUpdate) {
                this.onUpdate(losses / iterations, --this.remainingIterations)
            }
        }
        return losses
    }
}
