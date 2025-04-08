import { useEffect, useRef } from 'react'
type TimerCallback = (...params: any[]) => any

// https://felixgerschau.com/react-hooks-settimeout/
export const useTimeout = (callback: TimerCallback, delay: number | null) => {
    const savedCallback = useRef(callback)

    // Remember the latest callback if it changes.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the timeout.
    useEffect(() => {
        // Don't schedule if no delay is specified.
        if (delay === null) {
            return
        }

        const id = setTimeout(() => savedCallback.current(), delay)

        return () => clearTimeout(id)
    }, [delay])
}
