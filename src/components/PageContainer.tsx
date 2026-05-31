import { FC, PropsWithChildren } from 'react'

export const PageContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 -top-1/4 h-[60vw] w-[60vw] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[60vw] w-[60vw] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      {children}
    </div>
  )
}

export default PageContainer
