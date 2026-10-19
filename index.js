import { FlClashHost } from './host/app.js'

export const name = 'flclash-proxy'
export const inject = ['connection']

/**
 * Host half of the FLClash for DSH bundle.
 *
 * The bundle keeps a mihomo core on loopback for DSH only: it never touches the
 * system proxy, never enables TUN, and only publishes the loopback HTTP proxy
 * policy to this process. The Client half renders the floating ball and panel
 * and reaches this half through an authenticated exact Fetch route owned by the
 * DSH Connection service, so the same route works for the Web page and the
 * desktop shell carrier.
 */
export function apply(ctx, config) {
  const app = new FlClashHost(ctx, config)
  ctx.effect(() => {
    let dispose
    try {
      dispose = ctx.connection.fetch.register({
        path: '/api/flclash',
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          try {
            const payload = await request.json()
            return Response.json(await app.handleRpc(payload), {
              headers: { 'cache-control': 'no-store' },
            })
          } catch (error) {
            return Response.json({
              ok: false,
              error: {
                code: 'flclash/error',
                message: String(error?.message ?? error),
                details: {},
              },
            }, { headers: { 'cache-control': 'no-store' } })
          }
        },
      })
    } catch (error) {
      app.lastError = String(error?.message ?? error)
      return () => {}
    }
    app.ready = app.init().catch((error) => {
      app.lastError = String(error?.message ?? error)
      app.log(`init failed: ${app.lastError}`)
    })
    return async () => {
      try { await dispose() } catch {}
      await app.dispose()
    }
  })
}
