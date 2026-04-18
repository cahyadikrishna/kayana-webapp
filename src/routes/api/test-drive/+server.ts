/**
 * Google Drive endpoint with pagination support.
 * GET /api/test-drive?folderUrl=<url>&pageSize=50&pageToken=<token>
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GOOGLE_API_KEY } from '$env/static/private';
import { extractFolderIdFromUrl } from '$lib/utils/helpers.js';
import { fetchDriveFilesPaginated, countDriveFiles } from '$lib/server/google-drive.js';

export const GET: RequestHandler = async ({ url }) => {
	const folderUrl = url.searchParams.get('folderUrl');
	const pageSize = parseInt(url.searchParams.get('pageSize') ?? '50');
	const pageToken = url.searchParams.get('pageToken') ?? undefined;

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
		// Count only on first page load — subsequent pages reuse the total from the client
		const [result, total] = await Promise.all([
			fetchDriveFilesPaginated(folderId, pageSize, pageToken),
			pageToken ? Promise.resolve(null) : countDriveFiles(folderId)
		]);
		return json({
			folderId,
			files: result.files,
			pageToken: result.nextPageToken,
			hasMore: !!result.nextPageToken,
			...(total !== null && { total })
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		throw error(502, `Google Drive API error: ${msg}`);
	}
};
