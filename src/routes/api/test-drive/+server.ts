/**
 * Minimal Google Drive endpoint — no Supabase, no session lookup.
 * Used by the /test page to validate Drive folder access and file listing.
 *
 * GET /api/test-drive?folderUrl=<url>
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GOOGLE_API_KEY } from '$env/static/private';
import { extractFolderIdFromUrl } from '$lib/utils/helpers.js';
import { fetchDriveFiles } from '$lib/server/google-drive.js';

export const GET: RequestHandler = async ({ url }) => {
	const folderUrl = url.searchParams.get('folderUrl');

	if (!folderUrl) {
		throw error(400, 'folderUrl query parameter is required');
	}

	if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'placeholder_google_api_key') {
		throw error(500, 'GOOGLE_API_KEY is not configured in .env.local');
	}

	const folderId = extractFolderIdFromUrl(folderUrl);
	if (!folderId) {
		throw error(400, 'Could not extract a folder ID from that URL. Make sure it is a Google Drive folder link.');
	}

	try {
		const files = await fetchDriveFiles(folderId);
		return json({ folderId, files, total: files.length });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		throw error(502, `Google Drive API error: ${msg}`);
	}
};
