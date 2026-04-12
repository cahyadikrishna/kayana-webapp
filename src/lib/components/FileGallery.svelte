<script lang="ts">
	import { ImageOff } from 'lucide-svelte';
	import FileCard from './FileCard.svelte';
	import SearchFiles from './SearchFiles.svelte';
	import FilePreviewModal from './FilePreviewModal.svelte';
	import { selections, selectedFiles } from '$lib/stores/selections.js';
	import type { GoogleDriveFile, Selection } from '$lib/types/index.js';

	export let files: GoogleDriveFile[] = [];
	export let loading = false;

	let searchQuery = '';
	let previewOpen = false;
	let previewIndex = 0;

	/**
	 * Build a thumbnail URL that works for publicly shared Drive files
	 * without requiring Google authentication in the browser.
	 *
	 * drive.google.com/thumbnail is Google's official embed thumbnail endpoint —
	 * it works for any file shared as "Anyone with the link".
	 * thumbnailLink from the API requires auth cookies, so we skip it here.
	 */
	function thumbnailUrl(file: GoogleDriveFile): string {
		return `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;
	}

	$: filteredFiles = searchQuery.trim()
		? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: files;

	function toSelection(file: GoogleDriveFile): Selection {
		return { file_id: file.id, file_name: file.name, mimeType: file.mimeType };
	}

	function handleToggle(e: CustomEvent<GoogleDriveFile>) {
		selections.toggle(toSelection(e.detail));
	}

	function handlePreview(e: CustomEvent<GoogleDriveFile>) {
		previewIndex = filteredFiles.findIndex((f) => f.id === e.detail.id);
		previewOpen = true;
	}

	// Reactive Set so the grid re-renders whenever the store changes
	$: selectedIds = new Set($selectedFiles.map((f) => f.file_id));
</script>

<div class="flex flex-col gap-4">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<SearchFiles bind:query={searchQuery} />
		<p class="text-sm text-muted-foreground" aria-live="polite">
			{#if loading}
				Loading…
			{:else}
				{filteredFiles.length}
				{filteredFiles.length === 1 ? 'photo' : 'photos'}
				{searchQuery ? 'found' : 'total'}
			{/if}
		</p>
	</div>

	<!-- Loading skeleton -->
	{#if loading}
		<div
			class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			aria-busy="true"
			aria-label="Loading photos"
		>
			{#each { length: 10 } as _}
				<div class="overflow-hidden rounded-lg border bg-card">
					<div class="aspect-square animate-pulse bg-muted"></div>
					<div class="space-y-1.5 p-2">
						<div class="h-3 w-3/4 animate-pulse rounded bg-muted"></div>
						<div class="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Empty state -->
	{:else if filteredFiles.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center"
			role="status"
		>
			<ImageOff class="h-10 w-10 text-muted-foreground" aria-hidden="true" />
			{#if searchQuery}
				<div>
					<p class="font-medium">No photos match "{searchQuery}"</p>
					<p class="mt-1 text-sm text-muted-foreground">Try a different search term</p>
				</div>
			{:else}
				<div>
					<p class="font-medium">No photos in this folder</p>
					<p class="mt-1 text-sm text-muted-foreground">
						The Google Drive folder may be empty or inaccessible
					</p>
				</div>
			{/if}
		</div>

		<!-- Gallery grid -->
	{:else}
		<div
			class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			role="group"
			aria-label="Photo gallery"
		>
			{#each filteredFiles as file (file.id)}
				<FileCard
					{file}
					selected={selectedIds.has(file.id)}
					thumbnailUrl={thumbnailUrl(file)}
					on:toggle={handleToggle}
					on:preview={handlePreview}
				/>
			{/each}
		</div>
	{/if}
</div>

<FilePreviewModal
	files={filteredFiles}
	bind:currentIndex={previewIndex}
	bind:open={previewOpen}
/>
