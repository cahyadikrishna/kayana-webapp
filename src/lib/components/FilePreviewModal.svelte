<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-svelte';
	import type { GoogleDriveFile } from '$lib/types/index.js';

	export let files: GoogleDriveFile[] = [];
	export let currentIndex: number = 0;
	export let open = false;

	/** Called with the file ID when user toggles selection from the modal. */
	const dispatch = createEventDispatcher<{ toggle: GoogleDriveFile; close: void }>();

	$: file = files[currentIndex];
	$: hasPrev = currentIndex > 0;
	$: hasNext = currentIndex < files.length - 1;

	function prev() {
		if (hasPrev) currentIndex -= 1;
	}

	function next() {
		if (hasNext) currentIndex += 1;
	}

	function close() {
		open = false;
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open && file}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
		role="dialog"
		aria-modal="true"
		aria-label={`Preview: ${file.name}`}
		tabindex="-1"
		on:click|self={close}
		on:keydown={() => {}}
	>
		<!-- Close button -->
		<button
			type="button"
			class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
			aria-label="Close preview"
			on:click={close}
		>
			<X class="h-5 w-5" />
		</button>

		<!-- Prev button -->
		{#if hasPrev}
			<button
				type="button"
				class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
				aria-label="Previous photo"
				on:click={prev}
			>
				<ChevronLeft class="h-6 w-6" />
			</button>
		{/if}

		<!-- Next button -->
		{#if hasNext}
			<button
				type="button"
				class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
				aria-label="Next photo"
				on:click={next}
			>
				<ChevronRight class="h-6 w-6" />
			</button>
		{/if}

		<!-- Image — proxied through /api/thumb so no Google auth cookie needed -->
		<div class="flex max-h-[85vh] max-w-[85vw] flex-col items-center gap-3">
			{#if file.thumbnailLink}
				<img
					src="/api/thumb?u={encodeURIComponent(file.thumbnailLink.replace(/=s\d+/, '=s1600'))}"
					alt={file.name}
					class="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
				/>
			{:else}
				<img
					src="/api/thumb?u={encodeURIComponent(`https://drive.google.com/thumbnail?id=${file.id}&sz=w1600`)}"
					alt={file.name}
					class="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
				/>
			{/if}
			<div class="flex items-center gap-3">
				<p class="text-sm text-white/80">{file.name}</p>
				<a
					href={file.webViewLink}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1 text-xs text-white/60 hover:text-white underline"
				>
					Open in Drive <ExternalLink class="h-3 w-3" />
				</a>
			</div>
			<!-- Position indicator -->
			<p class="text-xs text-white/50">{currentIndex + 1} / {files.length}</p>
		</div>
	</div>
{/if}
