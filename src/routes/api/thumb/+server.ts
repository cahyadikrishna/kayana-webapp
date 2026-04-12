/**
 * Server-side thumbnail proxy.
 *
 * The browser can't load thumbnailLink URLs (lh3.googleusercontent.com) without
 * Google auth cookies. Fetching them from the server has no such restriction —
 * Google's CDN serves the image based on the sharing settings of the file, not
 * the requester's identity.
 *
 * GET /api/thumb?u=<url-encoded-google-cdn-url>
 *
 * Only Google's CDN hostnames are allowed (SSRF guard).
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ALLOWED_HOSTS = new Set(['lh3.googleusercontent.com', 'drive.google.com']);

export const GET: RequestHandler = async ({ url }) => {
	const raw = url.searchParams.get('u');
	if (!raw) throw error(400, 'Missing u parameter');

	let target: URL;
	try {
		target = new URL(raw);
	} catch {
		throw error(400, 'Invalid URL');
	}

	if (!ALLOWED_HOSTS.has(target.hostname)) {
		throw error(400, `Host not allowed: ${target.hostname}`);
	}

	const res = await fetch(target.toString(), {
		headers: {
			// Mimic a browser request so Google doesn't block the fetch
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
		}
	});

	if (!res.ok) {
		throw error(res.status, `Upstream error: ${res.statusText}`);
	}

	const contentType = res.headers.get('content-type') ?? 'image/jpeg';

	return new Response(res.body, {
		headers: {
			'content-type': contentType,
			// Cache on the browser for 1 h — thumbnailLinks expire ~2 h after issue
			'cache-control': 'public, max-age=3600'
		}
	});
};
