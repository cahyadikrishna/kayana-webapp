<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Camera } from 'lucide-svelte';
	import FileGallery from '$lib/components/FileGallery.svelte';
	import SelectionChecklist from '$lib/components/SelectionChecklist.svelte';
	import { selectedFiles, selectedCount, selections } from '$lib/stores/selections.js';
	import { APP_NAME } from '$lib/utils/constants.js';
	import type { PageData } from './$types';
	import { onDestroy } from 'svelte';

	export let data: PageData;

	let submitting = false;

	// Reset selections when navigating away
	onDestroy(() => selections.clear());

	async function handleSubmit() {
		if ($selectedCount === 0 || submitting) return;
		submitting = true;

		try {
			const res = await fetch('/api/selections', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionId: data.session.id,
					selectedFiles: $selectedFiles
				})
			});

			const result = (await res.json()) as { success?: boolean; error?: string };

			if (!res.ok || !result.success) {
				throw new Error(result.error ?? 'Submission failed');
			}

			toast.success('Selection submitted!', {
				description: `${$selectedCount} photos submitted successfully.`
			});
			selections.clear();
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Something went wrong';
			toast.error('Submission failed', { description: msg });
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{data.session.name} – {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
		<div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
			<Camera class="h-5 w-5 text-primary" aria-hidden="true" />
			<div class="min-w-0">
				<h1 class="truncate text-base font-semibold leading-tight">{data.session.name}</h1>
				<p class="text-xs text-muted-foreground">
					{data.files.length}
					{data.files.length === 1 ? 'photo' : 'photos'} available
				</p>
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<FileGallery files={data.files} />
	</main>

	<SelectionChecklist
		totalFiles={data.files.length}
		allFiles={data.files}
		{submitting}
		on:submit={handleSubmit}
	/>
</div>
