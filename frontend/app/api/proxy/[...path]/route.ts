import { NextRequest, NextResponse } from 'next/server';
import https from 'node:https';

const API_GATEWAY =
  process.env.API_GATEWAY_URL ||
  'https://p3xj2brlia.execute-api.us-west-2.amazonaws.com/Prod';

/**
 * Forward a request via node:https with family:4 (IPv4 only).
 *
 * Why node:https instead of global fetch (undici):
 *   undici (Node's built-in fetch) tries IPv6 first. CloudFront drops IPv6
 *   connections causing ConnectTimeoutError. node:https accepts a `family`
 *   option that pins DNS resolution to IPv4.
 *
 * Why this proxy exists instead of next.config.ts rewrites():
 *   Rewrite proxies stream the body in chunks. API Gateway drops large
 *   base64 PDF bodies mid-stream (ECONNRESET). This handler buffers the
 *   full body before forwarding.
 */
function forwardViaHttps(
  method: string,
  targetUrl: string,
  headers: Record<string, string>,
  body: string | null,
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const options: https.RequestOptions & { family?: number } = {
      hostname: url.hostname,
      port: url.port ? Number(url.port) : 443,
      path: url.pathname + url.search,
      method,
      headers,
      family: 4, // Force IPv4 — avoids IPv6 ConnectTimeoutError on CloudFront
      timeout: 60_000,
    };

    const req = https.request(options, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode ?? 502, text }));
    });

    req.on('timeout', () => { req.destroy(new Error('Request timed out')); });
    req.on('error', reject);

    if (body) req.write(body);
    req.end();
  });
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = '/' + pathSegments.join('/');
  const search = new URL(request.url).search;
  const targetUrl = `${API_GATEWAY}${path}${search}`;

  const forwardHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const auth = request.headers.get('Authorization');
  if (auth) forwardHeaders['Authorization'] = auth;

  let body: string | null = null;
  if (request.method === 'POST' || request.method === 'PUT') {
    body = await request.text();
    forwardHeaders['Content-Length'] = Buffer.byteLength(body).toString();
  }

  try {
    const { status, text } = await forwardViaHttps(
      request.method,
      targetUrl,
      forwardHeaders,
      body,
    );
    return new NextResponse(text, {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`[proxy] ${request.method} ${targetUrl} failed:`, err);
    return NextResponse.json(
      { message: 'Proxy error — could not reach API Gateway' },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, (await params).path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, (await params).path);
}
