import background from '../assets/sfx/background-music.mp3' //base 64
import score1 from '../assets/sfx/retro-coin-1.mp3'
import score2 from '../assets/sfx/retro-coin-2.mp3'
import score3 from '../assets/sfx/retro-coin-3.mp3'
import score4 from '../assets/sfx/retro-coin-4.mp3'

const scoreAudioPath: string[] = [score1, score2, score3, score4]
export class AudioController {
    private static instance: AudioController
    private muted: boolean = false
    private readonly audioContext: AudioContext
    private readonly scoreAudios: HTMLAudioElement[] = []
    private readonly backgroundAudio: HTMLAudioElement = new Audio(background)

    private constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        // this.backgroundAudio.play()
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
        AudioController.getInstance()
    }

    public static getInstance(): AudioController {
        if (!AudioController.instance) {
            AudioController.instance = new AudioController()
        }
        return AudioController.instance
    }

    public static playBackgroundSound(): void {
        const instance = AudioController.getInstance()
        if (instance.audioContext.state === 'suspended') {
            // instance.resume()
        }
        if (instance.muted) {
            // instance.backgroundAudio.pause()
            return
        }
        if (instance.audioContext.state === 'running') {
            // instance.backgroundAudio.play()
        }
    }
    public static setMuted(muted: boolean): void {
        const instance = AudioController.getInstance()

        instance.muted = muted
        if (muted) {
            // instance.backgroundAudio.pause()
        } else {
            // instance.backgroundAudio.play()
        }
    }

    public static playScoreSound(): void {
        const instance = AudioController.getInstance()

        if (instance.muted) {
            return
        }
        if (instance.audioContext) {
            const scoreAudios = instance.scoreAudios
            scoreAudios[Math.floor(Math.random() * scoreAudios.length)].play()
        }
    }
}
