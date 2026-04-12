<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { X, CheckSquare, Square, Send, ChevronUp, ChevronDown } from 'lucide-svelte';
	import { selections, selectedFiles, selectedCount } from '$lib/stores/selections.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { GoogleDriveFile } from '$lib/types/index.js';

	export let totalFiles: number = 0;
	export let submitting = false;
	export let allFiles: GoogleDriveFile[] = [];

	const dispatch = createEventDispatcher<{ submit: void }>();

	let expanded = false;

	$: percent = totalFiles > 0 ? ($selectedCount / totalFiles) * 100 : 0;

	function selectAll() {
		allFiles.forEach((f) =>
			selections.add({ file_id: f.id, file_name: f.name, mimeType: f.mimeType })
		);
	}
</script>

{#if $selectedCount > 0 || submitting}
	<div
		class="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 shadow-lg backdrop-blur-sm"
		role="region"
		aria-label="Selected photos"
	>
		<!-- Expand/collapse toggle -->
		<button
			type="button"
			class="flex w-full items-center justify-between px-4 py-2 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
			aria-expanded={expanded}
			on:click={() => (expanded = !expanded)}
		>
			<div class="flex items-center gap-3">
				<Badge class="tabular-nums">{$selectedCount} selected</Badge>
				<div class="hidden w-32 sm:block">
					<Progress value={$selectedCount} max={totalFiles} />
				</div>
				<span class="hidden text-xs text-muted-foreground sm:block">
					{Math.round(percent)}% of {totalFiles} photos
				</span>
			</div>
			<div class="flex items-center gap-2">
				{#if expanded}
					<ChevronDown class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
				{:else}
					<ChevronUp class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
				{/if}
			</div>
		</button>

		<!-- Expanded panel -->
		{#if expanded}
			<div class="border-t px-4 py-3">
				<!-- Actions row -->
				<div class="mb-3 flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onclick={selectAll}
						aria-label="Select all photos"
					>
						<CheckSquare class="mr-1.5 h-4 w-4" />
						Select all
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => selections.clear()}
						aria-label="Clear all selections"
					>
						<Square class="mr-1.5 h-4 w-4" />
						Clear all
					</Button>
				</div>

				<!-- Selected files list -->
				<ul
					class="max-h-32 overflow-y-auto rounded-md border bg-muted/30 p-2 space-y-1"
					aria-label="Selected photo list"
				>
					{#each $selectedFiles as sel (sel.file_id)}
						<li class="flex items-center justify-between gap-2 rounded px-1 py-0.5 text-sm">
							<span class="truncate text-foreground">{sel.file_name}</span>
							<button
								type="button"
								class="shrink-0 rounded text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								aria-label={`Remove ${sel.file_name} from selection`}
								on:click={() => selections.remove(sel.file_id)}
							>
								<X class="h-3.5 w-3.5" />
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Submit row -->
		<div class="flex items-center justify-between gap-3 border-t px-4 py-3">
			<p class="text-sm text-muted-foreground">
				Ready to submit your {$selectedCount}
				{$selectedCount === 1 ? 'photo' : 'photos'}?
			</p>
			<Button
				disabled={submitting || $selectedCount === 0}
				onclick={() => dispatch('submit')}
				aria-label={`Submit ${$selectedCount} selected photos`}
			>
				{#if submitting}
					<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
					Submitting…
				{:else}
					<Send class="mr-2 h-4 w-4" />
					Submit selection
				{/if}
			</Button>
		</div>
	</div>
{/if}

<!-- Spacer to prevent content from being hidden behind the sticky footer -->
{#if $selectedCount > 0}
	<div class="h-28" aria-hidden="true"></div>
{/if}
