import { useEffect, useState } from 'react'

export interface UseDebounceItProps {
  value: string
  delay?: number
}

const useDebounceIt = ({ value, delay = 1 }: UseDebounceItProps) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay * 1000)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounceIt
