import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';
import { supabase } from '$lib/server/db.js';
import { extractFolderIdFromUrl } from '$lib/utils/helpers.js';

const schema = z.object({
	name: z.string().min(1, 'Session name is required').max(100, 'Name must be under 100 characters'),
	drive_folder_url: z.string().url('Must be a valid URL')
});

interface FormErrors {
	name?: string;
	drive_folder_url?: string;
	general?: string;
}

interface FormValues {
	name: FormDataEntryValue | null;
	drive_folder_url: FormDataEntryValue | null;
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const raw: FormValues = {
			name: formData.get('name'),
			drive_folder_url: formData.get('drive_folder_url')
		};

		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			const errors: FormErrors = {};
			for (const e of parsed.error.errors) {
				const key = e.path[0] as keyof FormErrors;
				errors[key] = e.message;
			}
			return fail(422, { errors, values: raw });
		}

		const { name, drive_folder_url } = parsed.data;
		const folderId = extractFolderIdFromUrl(drive_folder_url);

		if (!folderId) {
			return fail(422, {
				errors: { drive_folder_url: 'Could not extract folder ID from this URL' } as FormErrors,
				values: raw
			});
		}

		const { error: insertError } = await supabase.from('sessions').insert({
			name,
			drive_folder_id: folderId,
			drive_folder_url
		});

		if (insertError) {
			console.error('Failed to create session:', insertError);
			return fail(500, {
				errors: { general: 'Failed to create session. Please try again.' } as FormErrors,
				values: raw
			});
		}

		redirect(303, '/admin');
	}
};
