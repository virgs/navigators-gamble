import { GameConfiguration } from '../engine/game-configuration/game-configuration'

const audioStorageKey = 'audioOn'
const dbName = 'BrowserDb'
const storeName = 'levelStats'

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

    private static async getDb(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1)
            request.onupgradeneeded = () => {
                const db = request.result
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
                }
            }
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    public static async getAudioStatus(): Promise<boolean> {
        const db = await this.getDb()
        return new Promise((resolve) => {
            const transaction = db.transaction(storeName, 'readonly')
            const store = transaction.objectStore(storeName)
            const request = store.get(audioStorageKey)
            request.onsuccess = () => {
                const isAudioOn = request.result?.value ?? 'true'
                resolve(isAudioOn === 'true')
            }
            request.onerror = () => resolve(true)
        })
    }

    public static async setAudioStatus(isAudioOn: boolean): Promise<void> {
        const db = await this.getDb()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite')
            const store = transaction.objectStore(storeName)
            const request = store.put({ id: audioStorageKey, value: isAudioOn ? 'true' : 'false' })
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    public static async getStats(): Promise<MatchStats[]> {
        const db = await this.getDb()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly')
            const store = transaction.objectStore(storeName)
            const request = store.getAll()
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    public static async getLevelStats(levelConfiguration: GameConfiguration): Promise<MatchStats[]> {
        const levelHash = this.getLevelHash(levelConfiguration)
        const stats = await this.getStats()
        return stats.filter((stat: MatchStats) => stat.levelHash === levelHash)
    }

    public static async addLevelStats(stats: MatchStats): Promise<void> {
        const db = await this.getDb()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite')
            const store = transaction.objectStore(storeName)
            const request = store.add(stats)
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }

    public static getLevelHash(levelConfiguration: GameConfiguration): string {
        return this.hashString(JSON.stringify(levelConfiguration))
    }

    public static async clearLevelStats(): Promise<void> {
        const db = await this.getDb()
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite')
            const store = transaction.objectStore(storeName)
            const request = store.clear()
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
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
