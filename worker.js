const FUNCS = ['bot', 'verify', 'go'];
let mods;

async function load(env) {
  if (mods) return mods;
  // Secret gulo process.env e boshai (code process.env diye pore)
  for (const [k, v] of Object.entries(env)) if (typeof v === 'string') process.env[k] = v;
  mods = {
    bot: (await import('./netlify/functions/bot.js')).default,
    verify: (await import('./netlify/functions/verify.js')).default,
    go: (await import('./netlify/functions/go.js')).default
  };
  return mods;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/\.netlify\/functions\/(\w+)$/);
    if (!m || !FUNCS.includes(m[1])) return new Response('Not found', { status: 404 });

    const fn = (await load(env))[m[1]];
    const headers = Object.fromEntries(request.headers);
    headers['x-nf-client-connection-ip'] = headers['cf-connecting-ip'] || '';
    const res = await fn.handler({
      httpMethod: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? null : await request.text(),
      queryStringParameters: Object.fromEntries(url.searchParams)
    });
    return new Response(res.body ?? '', { status: res.statusCode || 200, headers: res.headers || {} });
  }
};
