import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/db.js';
import { fetchDriveFiles } from '$lib/server/google-drive.js';
import type { Session } from '$lib/types/index.js';

export const load: PageServerLoad = async ({ params }) => {
	const { sessionId } = params;

	// Load session from database
	const { data: session, error: dbError } = await supabase
		.from('sessions')
		.select('*')
		.eq('id', sessionId)
		.single<Session>();

	if (dbError || !session) {
		throw error(404, 'Session not found. Please check your link and try again.');
	}

	// Fetch files from Google Drive
	let files;
	try {
		files = await fetchDriveFiles(session.drive_folder_id);
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		throw error(502, `Failed to load photos from Google Drive: ${msg}`);
	}

	return { session, files };
};
