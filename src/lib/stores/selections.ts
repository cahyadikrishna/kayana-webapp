import { writable, derived } from 'svelte/store';
import type { Selection } from '$lib/types';

/** Map of file_id → Selection for O(1) lookups. */
const _selections = writable<Map<string, Selection>>(new Map());

export const selections = {
	subscribe: _selections.subscribe,

	/** Add a file to the selection. No-op if already selected. */
	add(file: Selection) {
		_selections.update((map) => {
			if (!map.has(file.file_id)) {
				const next = new Map(map);
				next.set(file.file_id, file);
				return next;
			}
			return map;
		});
	},

	/** Remove a file from the selection by ID. */
	remove(fileId: string) {
		_selections.update((map) => {
			if (map.has(fileId)) {
				const next = new Map(map);
				next.delete(fileId);
				return next;
			}
			return map;
		});
	},

	/** Toggle a file's selected state. */
	toggle(file: Selection) {
		_selections.update((map) => {
			const next = new Map(map);
			if (next.has(file.file_id)) {
				next.delete(file.file_id);
			} else {
				next.set(file.file_id, file);
			}
			return next;
		});
	},

	/** Replace all selections with a new set. */
	setAll(files: Selection[]) {
		_selections.set(new Map(files.map((f) => [f.file_id, f])));
	},

	/** Clear all selections. */
	clear() {
		_selections.set(new Map());
	},

	/** Check if a file is currently selected (sync snapshot). */
	isSelected(fileId: string): boolean {
		let result = false;
		// unsubscribe immediately — just a snapshot
		const unsub = _selections.subscribe((map) => {
			result = map.has(fileId);
		});
		unsub();
		return result;
	}
};

/** Derived store: array of all selected files. */
export const selectedFiles = derived(_selections, ($map) => Array.from($map.values()));

/** Derived store: count of selected files. */
export const selectedCount = derived(_selections, ($map) => $map.size);
