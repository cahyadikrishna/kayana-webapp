import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind CSS classes safely. */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Format bytes to human-readable string (e.g. "1.2 MB"). */
export function formatFileSize(bytes: string | undefined): string {
	if (!bytes) return 'Unknown size';
	const n = parseInt(bytes, 10);
	if (isNaN(n)) return 'Unknown size';
	if (n < 1024) return `${n} B`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
	if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
	return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** Return a human-friendly label for a MIME type. */
export function getFileTypeLabel(mimeType: string): string {
	const map: Record<string, string> = {
		'image/jpeg': 'JPEG',
		'image/png': 'PNG',
		'image/gif': 'GIF',
		'image/webp': 'WebP',
		'image/heic': 'HEIC',
		'image/tiff': 'TIFF',
		'image/bmp': 'BMP',
		'image/svg+xml': 'SVG'
	};
	return map[mimeType] ?? mimeType.split('/')[1]?.toUpperCase() ?? 'File';
}

/** Check if a MIME type represents an image. */
export function isImageMimeType(mimeType: string): boolean {
	return mimeType.startsWith('image/');
}

/**
 * Extract the Google Drive folder ID from a URL.
 * Supports both /folders/<id> and ?id=<id> patterns.
 */
export function extractFolderIdFromUrl(url: string): string | null {
	try {
		const u = new URL(url);
		// Pattern: /drive/folders/<id>
		const folderMatch = u.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
		if (folderMatch) return folderMatch[1];
		// Pattern: ?id=<id>
		const idParam = u.searchParams.get('id');
		if (idParam) return idParam;
		return null;
	} catch {
		return null;
	}
}

/** Format a date string to locale-aware display. */
export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
