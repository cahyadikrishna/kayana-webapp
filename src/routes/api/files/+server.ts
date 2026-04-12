import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/db.js';
import { fetchDriveFiles } from '$lib/server/google-drive.js';
import type { Session } from '$lib/types/index.js';

export const GET: RequestHandler = async ({ url }) => {
	const sessionId = url.searchParams.get('sessionId');

	if (!sessionId) {
		throw error(400, 'sessionId query parameter is required');
	}

	const { data: session, error: dbError } = await supabase
		.from('sessions')
		.select('*')
		.eq('id', sessionId)
		.single<Session>();

	if (dbError || !session) {
		throw error(404, 'Session not found');
	}

	try {
		const files = await fetchDriveFiles(session.drive_folder_id);
		return json({ files });
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		throw error(502, `Google Drive error: ${msg}`);
	}
};
