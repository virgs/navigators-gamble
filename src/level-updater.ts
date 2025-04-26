import { GameConfiguration } from './engine/game-configuration/game-configuration'
import { gameConfigurationLimits } from './engine/game-configuration/game-configuration-validator'
import { PlayerType } from './engine/game-configuration/player-type'
import { LevelEvaluator } from './engine/level-evaluator/level-evaluator'
import { clamp } from './math/clamp'

export const updateLevelData = async () => {
    console.log('Updating level data...')
    const exportLevel = (config: GameConfiguration, levelName: string) => {
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${levelName}.json`
        a.click()
    }

    const filenames: Record<string, GameConfiguration> = import.meta.glob(`./assets/levels/*.json`, {
        eager: true,
        import: 'default',
    })

    console.log(`Found ${Object.keys(filenames).length} levels`)

    let counter = 0
    for (const [, config] of Object.entries(filenames)) {
        counter++
        console.log(`Importing level ${config.levelName}. Level ${counter} of ${Object.keys(filenames).length}`)
        config.initialCardsPerPlayer = clamp(
            config.initialCardsPerPlayer * 1.25,
            gameConfigurationLimits.initialCardsPerPlayer
        )
        config.cardsPerDirection = clamp(config.cardsPerDirection, gameConfigurationLimits.cardsPerDirection)
        config.players = config.players.map((player) => {
            if (player.type === PlayerType.ARTIFICIAL_INTELLIGENCE) {
                return {
                    ...player,
                    iterationsPerAlternative: clamp(
                        player.iterationsPerAlternative * 4,
                        gameConfigurationLimits.intelligence.ai
                    ),
                }
            }
            return player
        })
        const previousDifficulty = config.estimatedDifficulty
        config.estimatedDifficulty = await new LevelEvaluator(JSON.parse(JSON.stringify(config))).evaluate(100)
        console.log(
            `Exporting level ${config.levelName}. Estimated difficulty: ${config.estimatedDifficulty}. Previous: ${previousDifficulty}`
        )
        exportLevel(config, config.levelName)
    }
}
