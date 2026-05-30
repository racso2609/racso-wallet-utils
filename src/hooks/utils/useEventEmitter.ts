import { useEffect } from 'react'
import eventEmitter from '../../utils/event-emitter'

export function useEventEmitter(
  eventName: string,
  listener: (data: unknown) => void,
): void {
  useEffect(() => {
    eventEmitter.on(eventName, listener)
    return () => {
      eventEmitter.off(eventName, listener)
    }
  }, [eventName, listener])
}
