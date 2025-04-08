import { useEffect, useRef } from 'react'

type TimerCallback = (...params: any[]) => any

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (callback: TimerCallback, delay?: number) => {
    const savedCallback = useRef<TimerCallback>(undefined)

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback && savedCallback.current) {
                savedCallback.current()
            }
        }
        if (delay !== undefined) {
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}
