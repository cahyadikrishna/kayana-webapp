import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/server/db.js';
import type { Session } from '$lib/types/index.js';

export const load: PageServerLoad = async () => {
	// Fetch all sessions
	const { data: sessions, error: sessionsError } = await supabase
		.from('sessions')
		.select('*')
		.order('created_at', { ascending: false })
		.returns<Session[]>();

	if (sessionsError) {
		throw error(500, 'Failed to load sessions');
	}

	// Fetch submission counts per session
	const { data: counts, error: countsError } = await supabase
		.from('selections')
		.select('session_id');

	if (countsError) {
		console.error('Failed to load submission counts:', countsError);
	}

	// Build a count map: session_id → number of submissions
	const countMap = new Map<string, number>();
	for (const row of counts ?? []) {
		const r = row as { session_id: string };
		countMap.set(r.session_id, (countMap.get(r.session_id) ?? 0) + 1);
	}

	const sessionsWithCounts = (sessions ?? []).map((s) => ({
		...s,
		submission_count: countMap.get(s.id) ?? 0
	}));

	return { sessions: sessionsWithCounts };
};
