import { useEffect } from 'react'
import eventEmitter from '../../utils/event-emitter'

export function useEventEmitter<T>(
  eventName: string,
  listener: (data: T) => void,
): void {
  useEffect(() => {
    eventEmitter.on(eventName, listener)
    return () => {
      eventEmitter.off(eventName, listener)
    }
  }, [eventName, listener])
}
