import { PassThrough } from 'stream'
import { renderToPipeableStream } from 'react-dom/server'
import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        onShellError(error: unknown) {
          reject(
            error instanceof Error ? error : new Error(String(error)),
          )
        },
        onError(error: unknown) {
          console.error(error)
        },
      },
    )

    const body = new PassThrough()

    responseHeaders.set('Content-Type', 'text/html')

    const stream = new ReadableStream({
      start(controller) {
        body.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk))
        })
        body.on('end', () => {
          controller.close()
        })
        body.on('error', (err: Error) => {
          controller.error(err)
        })
      },
      cancel() {
        abort()
      },
    })

    pipe(body)

    resolve(
      new Response(stream, {
        headers: responseHeaders,
        status: responseStatusCode,
      }),
    )
  })
}
