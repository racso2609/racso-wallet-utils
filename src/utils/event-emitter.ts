type Listener = (...args: any[]) => void

class EventEmitter {
  private events: Map<string, Listener[]>

  constructor() {
    this.events = new Map()
  }

  on(event: string, listener: Listener): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  off(event: string, listener: Listener): void {
    const listeners = this.events.get(event)
    if (!listeners) return
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
    if (listeners.length === 0) {
      this.events.delete(event)
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event)
    if (!listeners) return
    listeners.forEach((listener) => listener(...args))
  }
}

const eventEmitter = new EventEmitter()
export default eventEmitter
