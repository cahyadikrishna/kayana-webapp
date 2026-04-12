import { GOOGLE_API_KEY } from '$env/static/private';
import {
	GOOGLE_DRIVE_API_BASE,
	DRIVE_FILE_FIELDS,
	IMAGE_MIME_TYPES,
	DRIVE_PAGE_SIZE
} from '$lib/utils/constants';
import type { GoogleDriveFile } from '$lib/types';

/**
 * Fetch all image files from a Google Drive folder.
 * Handles pagination automatically to return all files.
 */
export async function fetchDriveFiles(folderId: string): Promise<GoogleDriveFile[]> {
	const mimeQuery = IMAGE_MIME_TYPES.map((t) => `mimeType='${t}'`).join(' or ');
	const q = encodeURIComponent(`'${folderId}' in parents and (${mimeQuery}) and trashed=false`);

	const allFiles: GoogleDriveFile[] = [];
	let pageToken: string | undefined;

	do {
		const pageParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
		const url =
			`${GOOGLE_DRIVE_API_BASE}/files` +
			`?q=${q}` +
			`&fields=nextPageToken,${DRIVE_FILE_FIELDS}` +
			`&pageSize=${DRIVE_PAGE_SIZE}` +
			`&key=${GOOGLE_API_KEY}` +
			pageParam;

		const res = await fetch(url);

		if (!res.ok) {
			const error = await res.json().catch(() => ({}));
			throw new Error(
				`Google Drive API error ${res.status}: ${(error as { error?: { message?: string } }).error?.message ?? res.statusText}`
			);
		}

		const data = (await res.json()) as { files: GoogleDriveFile[]; nextPageToken?: string };
		allFiles.push(...(data.files ?? []));
		pageToken = data.nextPageToken;
	} while (pageToken);

	return allFiles;
}

/**
 * Build a thumbnail URL for a Drive file at a specific pixel width.
 * Falls back to the Drive API thumbnail endpoint if no thumbnailLink is set.
 */
export function getThumbnailUrl(file: GoogleDriveFile, width = 400): string {
	if (file.thumbnailLink) {
		// Replace the default size (s220) with requested width
		return file.thumbnailLink.replace(/=s\d+$/, `=s${width}`);
	}
	// Public thumbnail via Drive API (works for files shared "Anyone with the link")
	return `${GOOGLE_DRIVE_API_BASE}/files/${file.id}?alt=media&key=${GOOGLE_API_KEY}`;
}
