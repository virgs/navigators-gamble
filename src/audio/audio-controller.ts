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
    private readonly backgroundAudio: HTMLAudioElement = new Audio(
        '/assets/sfx/dread-pirate-roberts-sea-shanty-dance-edm-soundtrack-153022.mp3'
    )

    private constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        this.backgroundAudio.loop = true
        this.backgroundAudio.volume = 0.5
        this.backgroundAudio.play()

        scoreAudioPath.forEach((path) => {
            const audio = new Audio(path)
            audio.volume = 0.5
            audio.load()
            this.scoreAudios.push(audio)
        })
    }

    public static getInstance(): AudioController {
        if (!AudioController.instance) {
            AudioController.instance = new AudioController()
        }
        return AudioController.instance
    }

    playBackgroundSound(): void {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume()
        }
        if (this.muted) {
            this.backgroundAudio.pause()
            return
        }
        if (this.audioContext.state === 'running') {
            this.backgroundAudio.play()
        }
    }
    public setMuted(muted: boolean): void {
        this.muted = muted
        if (muted) {
            this.backgroundAudio.pause()
        } else {
            this.backgroundAudio.play()
        }
    }

    public static playScoreSound(): void {
        if (AudioController.getInstance().muted) {
            return
        }
        if (AudioController.getInstance().audioContext) {
            const scoreAudios = AudioController.getInstance().scoreAudios
            scoreAudios[Math.floor(Math.random() * scoreAudios.length)].play()
        }
    }
}
