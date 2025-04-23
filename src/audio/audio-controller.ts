import background from '../assets/sfx/background-music.mp3' //base 64
import score1 from '../assets/sfx/retro-coin-1.mp3'
import score2 from '../assets/sfx/retro-coin-2.mp3'
import score3 from '../assets/sfx/retro-coin-3.mp3'
import score4 from '../assets/sfx/retro-coin-4.mp3'
import pop1 from '../assets/sfx/pop1.mp3'
import pop2 from '../assets/sfx/pop2.mp3'
import pop3 from '../assets/sfx/pop3.mp3'
import chain from '../assets/sfx/chain.mp3'
import { BrowserDb } from '../repository/browser-db'
import { sleep } from '../math/sleep'

const scoreAudioPath: string[] = [score1, score2, score3, score4]
const popAudiosPath: string[] = [pop1, pop2, pop3]
export class AudioController {
    private static instance: AudioController
    private readonly audioContext: AudioContext
    private readonly scoreAudios: HTMLAudioElement[] = []
    private readonly popAudios: HTMLAudioElement[] = []
    private readonly chainAudio: HTMLAudioElement = new Audio(chain)
    private readonly backgroundAudio: HTMLAudioElement = new Audio(background)
    private paused: boolean = false
    private _muted: boolean = false

    private constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        BrowserDb.getAudioStatus().then((status) => {
            this._muted = !status
        })
        this.backgroundAudio.loop = true
        this.backgroundAudio.volume = 0.5

        scoreAudioPath.forEach((path) => {
            const audio = new Audio(path)
            audio.volume = 0.5
            audio.load()
            this.scoreAudios.push(audio)
        })
        popAudiosPath.forEach((path) => {
            const audio = new Audio(path)
            audio.volume = 0.5
            audio.load()
            this.popAudios.push(audio)
        })
        document.addEventListener('visibilitychange', () => {
            this.paused = document.visibilityState !== 'visible'
            if (this.paused) {
                this.backgroundAudio.pause()
            } else {
                if (!this._muted) {
                    this.backgroundAudio.play().catch((error) => {
                        console.error('Error playing audio:', error)
                    })
                }
            }
        })
    }

    public static start() {
        const instance = AudioController.getInstance()
        if (!instance._muted) {
            if (instance.backgroundAudio.paused) {
                instance.backgroundAudio.play()
            }
        }
    }

    public static getInstance(): AudioController {
        if (!AudioController.instance) {
            AudioController.instance = new AudioController()
        }
        return AudioController.instance
    }

    public static toggleMute() {
        const instance = AudioController.getInstance()
        this.setMuted(!instance._muted)
    }

    public static async setMuted(muted: boolean): Promise<void> {
        const instance = AudioController.getInstance()
        instance._muted = muted
        if (muted) {
            instance.backgroundAudio.pause()
            await BrowserDb.setAudioStatus(false)
        } else {
            instance.backgroundAudio.play()
            await BrowserDb.setAudioStatus(true)
        }
    }

    public static isMuted(): boolean {
        return AudioController.getInstance()._muted
    }

    public static playScoreSound(): void {
        const instance = AudioController.getInstance()
        if (instance._muted) {
            return
        }
        if (instance.audioContext) {
            const scoreAudios = instance.scoreAudios
            scoreAudios[Math.floor(Math.random() * scoreAudios.length)].play()
        }
    }

    public static playPopSound(): void {
        const instance = AudioController.getInstance()
        if (instance._muted) {
            return
        }
        if (instance.audioContext) {
            const popAudios = instance.popAudios
            popAudios[Math.floor(Math.random() * popAudios.length)].play()
        }
    }

    public static async playChainSound(): Promise<void> {
        const instance = AudioController.getInstance()
        if (instance._muted) {
            return
        }
        if (instance.audioContext) {
            await sleep(150)
            instance.chainAudio.play()
        }
    }
}
