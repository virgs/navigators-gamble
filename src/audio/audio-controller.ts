import background from '../assets/sfx/background-music.mp3' //base 64
import score1 from '../assets/sfx/retro-coin-1.mp3'
import score2 from '../assets/sfx/retro-coin-2.mp3'
import score3 from '../assets/sfx/retro-coin-3.mp3'
import score4 from '../assets/sfx/retro-coin-4.mp3'
import { BrowserDb } from '../repository/browser-db'

const scoreAudioPath: string[] = [score1, score2, score3, score4]
export class AudioController {
    private static instance: AudioController
    private readonly audioContext: AudioContext
    private readonly scoreAudios: HTMLAudioElement[] = []
    private readonly backgroundAudio: HTMLAudioElement = new Audio(background)
    private _muted: boolean = false

    private constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        this._muted = !BrowserDb.getAudioStatus()
        this.backgroundAudio.loop = true
        this.backgroundAudio.volume = 0.5

        scoreAudioPath.forEach((path) => {
            const audio = new Audio(path)
            audio.volume = 0.5
            audio.load()
            this.scoreAudios.push(audio)
        })
    }

    public static start() {
        const instance = AudioController.getInstance()
        if (!instance._muted) {
            instance.backgroundAudio.play()
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

    public static setMuted(muted: boolean): void {
        const instance = AudioController.getInstance()
        instance._muted = muted
        if (muted) {
            console.log('AudioController: muted')
            instance.backgroundAudio.pause()
            BrowserDb.setAudioStatus(false)
        } else {
            console.log('AudioController: unmuted')
            instance.backgroundAudio.play()
            BrowserDb.setAudioStatus(true)
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
}
