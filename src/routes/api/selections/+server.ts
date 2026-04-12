import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/server/db.js';

const selectionSchema = z.object({
	file_id: z.string().min(1),
	file_name: z.string().min(1),
	mimeType: z.string().min(1)
});

const bodySchema = z.object({
	sessionId: z.string().uuid('sessionId must be a valid UUID'),
	selectedFiles: z.array(selectionSchema).min(1, 'At least one file must be selected')
});

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const parsed = bodySchema.safeParse(body);
	if (!parsed.success) {
		const msg = parsed.error.errors.map((e) => e.message).join(', ');
		throw error(422, `Validation error: ${msg}`);
	}

	const { sessionId, selectedFiles } = parsed.data;

	// Verify session exists
	const { data: session, error: dbError } = await supabase
		.from('sessions')
		.select('id')
		.eq('id', sessionId)
		.single();

	if (dbError || !session) {
		throw error(404, 'Session not found');
	}

	// Insert submission
	const { data: record, error: insertError } = await supabase
		.from('selections')
		.insert({ session_id: sessionId, selected_files: selectedFiles })
		.select('id')
		.single();

	if (insertError || !record) {
		console.error('Supabase insert error:', insertError);
		throw error(500, 'Failed to save selection');
	}

	return json({ success: true, id: (record as { id: string }).id }, { status: 201 });
};
