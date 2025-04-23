import { GameConfiguration } from '../engine/game-configuration/game-configuration'

const audioStorageKey = 'audioOn'

export type MatchStats = {
    victory: boolean
    defeat: boolean
    draw: boolean
    levelConfiguration: GameConfiguration
    levelHash: string
    timestamp: number
}

export class BrowserDb {
    private constructor() {}

    public static getAudioStatus(): boolean {
        const isAudioOn = localStorage.getItem(audioStorageKey)
        if (isAudioOn === null || isAudioOn === 'true') {
            localStorage.setItem(audioStorageKey, 'true')
            return true
        } else {
            return false
        }
    }
    public static setAudioStatus(isAudioOn: boolean): void {
        if (isAudioOn) {
            localStorage.setItem(audioStorageKey, 'true')
        } else {
            localStorage.setItem(audioStorageKey, 'false')
        }
    }
    public static getStats(): MatchStats[] {
        const stats = localStorage.getItem('levelStats')
        if (stats === null) {
            return []
        } else {
            return JSON.parse(stats)
        }
    }
    public static getLevelStats(levelConfiguration: GameConfiguration): MatchStats[] {
        const levelHash = BrowserDb.getLevelHash(levelConfiguration)
        return BrowserDb.getStats().filter((stat: MatchStats) => stat.levelHash === levelHash)
    }
    public static addLevelStats(stats: MatchStats): void {
        const currentStats = this.getStats()
        currentStats.push(stats)
        localStorage.setItem('levelStats', JSON.stringify(currentStats))
    }

    public static getLevelHash(levelConfiguration: GameConfiguration): string {
        const hash = this.hashString(JSON.stringify(levelConfiguration))
        return hash
    }

    public static clearLevelStats(): void {
        console.log('Clearing level stats')
        localStorage.removeItem('levelStats')
    }

    private static hashString(str: string): string {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i)
            hash |= 0 // Convert to 32bit integer
        }
        return hash.toString()
    }
}
