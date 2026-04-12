/** Google Drive API base URL for file listing. */
export const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/** Fields to request from the Google Drive files.list API. */
export const DRIVE_FILE_FIELDS =
	'files(id,name,mimeType,webViewLink,thumbnailLink,modifiedTime,size)';

/** Image MIME types to include in gallery. */
export const IMAGE_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/heic',
	'image/tiff',
	'image/bmp',
	'image/svg+xml'
];

/** Maximum files per Drive API page. */
export const DRIVE_PAGE_SIZE = 100;

/** App name shown in the UI. */
export const APP_NAME = 'Kayana';
