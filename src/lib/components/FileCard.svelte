<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Check, ImageIcon, ZoomIn } from 'lucide-svelte';
	import { cn } from '$lib/utils/helpers.js';
	import { formatFileSize, getFileTypeLabel } from '$lib/utils/helpers.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { GoogleDriveFile } from '$lib/types/index.js';

	export let file: GoogleDriveFile;
	export let selected = false;
	export let thumbnailUrl: string;

	const dispatch = createEventDispatcher<{
		toggle: GoogleDriveFile;
		preview: GoogleDriveFile;
	}>();

	let imgLoaded = false;
	let imgError = false;

	function handleToggle(e: MouseEvent | KeyboardEvent) {
		// Don't toggle when clicking the preview button
		if ((e.target as HTMLElement).closest('[data-preview-btn]')) return;
		dispatch('toggle', file);
	}

	function handlePreview(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		dispatch('preview', file);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleToggle(e);
		}
	}
</script>

<div
	class={cn(
		'group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all duration-200 cursor-pointer',
		'hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
		selected && 'ring-2 ring-primary ring-offset-1 border-primary'
	)}
	role="checkbox"
	aria-checked={selected}
	aria-label={`${selected ? 'Deselect' : 'Select'} ${file.name}`}
	tabindex="0"
	on:click={handleToggle}
	on:keydown={handleKeydown}
>
	<!-- Thumbnail -->
	<div class="relative aspect-square w-full bg-muted overflow-hidden">
		{#if !imgError}
			<img
				src={thumbnailUrl}
				alt={file.name}
				loading="lazy"
				class={cn(
					'h-full w-full object-cover transition-all duration-300',
					imgLoaded ? 'opacity-100' : 'opacity-0',
					'group-hover:scale-105'
				)}
				on:load={() => (imgLoaded = true)}
				on:error={() => (imgError = true)}
			/>
		{/if}

		<!-- Skeleton while loading -->
		{#if !imgLoaded && !imgError}
			<div class="absolute inset-0 animate-pulse bg-muted"></div>
		{/if}

		<!-- Fallback icon for error -->
		{#if imgError}
			<div class="absolute inset-0 flex items-center justify-center">
				<ImageIcon class="h-12 w-12 text-muted-foreground" />
			</div>
		{/if}

		<!-- Selection checkbox overlay -->
		<div
			class={cn(
				'absolute top-2 left-2 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
				selected
					? 'bg-primary border-primary'
					: 'bg-white/80 border-white group-hover:border-primary/70'
			)}
			aria-hidden="true"
		>
			{#if selected}
				<Check class="h-3.5 w-3.5 text-primary-foreground" />
			{/if}
		</div>

		<!-- Preview button -->
		<button
			type="button"
			data-preview-btn
			class="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring"
			aria-label={`Preview ${file.name}`}
			on:click={handlePreview}
			on:keydown={(e) => e.key === 'Enter' && handlePreview(e)}
		>
			<ZoomIn class="h-4 w-4 text-foreground" />
		</button>

		<!-- Selected overlay tint -->
		{#if selected}
			<div class="absolute inset-0 bg-primary/10 pointer-events-none"></div>
		{/if}
	</div>

	<!-- File info -->
	<div class="flex items-start gap-2 p-2">
		<div class="min-w-0 flex-1">
			<p class="truncate text-xs font-medium leading-tight text-foreground" title={file.name}>
				{file.name}
			</p>
			<p class="mt-0.5 text-xs text-muted-foreground">
				{formatFileSize(file.size)}
			</p>
		</div>
		<Badge variant="outline" class="shrink-0 text-[10px] px-1.5 py-0">
			{getFileTypeLabel(file.mimeType)}
		</Badge>
	</div>
</div>
