<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ImageOff } from 'lucide-svelte';
	import FileCard from './FileCard.svelte';
	import SearchFiles from './SearchFiles.svelte';
	import FilePreviewModal from './FilePreviewModal.svelte';
	import { selections, selectedFiles } from '$lib/stores/selections.js';
	import type { GoogleDriveFile, Selection } from '$lib/types/index.js';

	export let files: GoogleDriveFile[] = [];
	export let loading = false;
	export let isLoadingMore = false;
	export let hasMore = false;
	export let onLoadMore: (() => Promise<void>) | undefined = undefined;

	let searchQuery = '';
	let previewOpen = false;
	let previewIndex = 0;
	let sentinel: HTMLDivElement;
	let observer: IntersectionObserver;

	$: if (sentinel) {
		observer?.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
					onLoadMore();
				}
			},
			{ rootMargin: '300px' }
		);
		observer.observe(sentinel);
	}

	onDestroy(() => observer?.disconnect());

	/**
	 * Route thumbnails through our server proxy (/api/thumb).
	 * thumbnailLink from the Drive API (lh3.googleusercontent.com) requires
	 * Google auth cookies when fetched directly by the browser. The server
	 * proxy fetches the same URL without that restriction.
	 */
	function thumbnailUrl(file: GoogleDriveFile): string {
		const googleUrl = file.thumbnailLink
			? file.thumbnailLink.replace(/=s\d+/, '=s400')
			: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;
		return `/api/thumb?u=${encodeURIComponent(googleUrl)}`;
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

			{#if isLoadingMore}
				<div class="col-span-full py-6 text-center text-sm text-muted-foreground">
					Loading more…
				</div>
			{/if}

			{#if !hasMore && filteredFiles.length > 0 && !loading}
				<div class="col-span-full py-4 text-center text-xs text-muted-foreground">
					All photos loaded
				</div>
			{/if}

			<div bind:this={sentinel} class="col-span-full h-1" aria-hidden="true"></div>
		</div>
	{/if}
</div>

<FilePreviewModal
	files={filteredFiles}
	bind:currentIndex={previewIndex}
	bind:open={previewOpen}
/>
