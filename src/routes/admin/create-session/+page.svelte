<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, FolderOpen } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { APP_NAME } from '$lib/utils/constants.js';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let submitting = false;

	// Cast to a permissive type so we can read fields without exhaustive narrowing
	$: errors = (form as { errors?: Record<string, string> } | null)?.errors ?? {};
	$: values = (form as { values?: Record<string, string> } | null)?.values ?? {};
</script>

<svelte:head>
	<title>Create Session – {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<header class="border-b bg-background">
		<div class="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
			<Button variant="ghost" size="icon" href="/admin" aria-label="Back to admin">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="text-xl font-bold">Create Session</h1>
				<p class="text-sm text-muted-foreground">Set up a new photo selection session</p>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
		<div class="rounded-lg border bg-card p-6 shadow-sm">
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-primary/10 p-2">
					<FolderOpen class="h-5 w-5 text-primary" aria-hidden="true" />
				</div>
				<div>
					<h2 class="font-semibold">New Session</h2>
					<p class="text-sm text-muted-foreground">
						Connect a Google Drive folder to create a shareable gallery
					</p>
				</div>
			</div>

			{#if errors.general}
				<div
					class="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
					role="alert"
				>
					{errors.general}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
				class="space-y-5"
				novalidate
			>
				<!-- Session name -->
				<div class="space-y-1.5">
					<label for="name" class="block text-sm font-medium">
						Session name <span class="text-destructive" aria-hidden="true">*</span>
					</label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="e.g. Wedding – Smith & Jones"
						value={values.name ?? ''}
						aria-describedby={errors.name ? 'name-error' : undefined}
						aria-invalid={!!errors.name}
						required
					/>
					{#if errors.name}
						<p id="name-error" class="text-xs text-destructive" role="alert">
							{errors.name}
						</p>
					{/if}
				</div>

				<!-- Google Drive folder URL -->
				<div class="space-y-1.5">
					<label for="drive_folder_url" class="block text-sm font-medium">
						Google Drive folder URL <span class="text-destructive" aria-hidden="true">*</span>
					</label>
					<Input
						id="drive_folder_url"
						name="drive_folder_url"
						type="url"
						placeholder="https://drive.google.com/drive/folders/…"
						value={values.drive_folder_url ?? ''}
						aria-describedby={errors.drive_folder_url ? 'url-error' : 'url-hint'}
						aria-invalid={!!errors.drive_folder_url}
						required
					/>
					{#if errors.drive_folder_url}
						<p id="url-error" class="text-xs text-destructive" role="alert">
							{errors.drive_folder_url}
						</p>
					{:else}
						<p id="url-hint" class="text-xs text-muted-foreground">
							The folder must be shared as "Anyone with the link can view"
						</p>
					{/if}
				</div>

				<div class="flex gap-3 pt-2">
					<Button type="submit" disabled={submitting} class="flex-1 sm:flex-none">
						{#if submitting}
							<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
							Creating…
						{:else}
							Create session
						{/if}
					</Button>
					<Button variant="outline" href="/admin">Cancel</Button>
				</div>
			</form>
		</div>

		<div class="mt-6 rounded-lg border bg-muted/30 p-4">
			<h3 class="mb-2 text-sm font-medium">How to get the Google Drive folder URL</h3>
			<ol class="space-y-1.5 text-sm text-muted-foreground">
				<li>1. Open Google Drive and navigate to your photo folder</li>
				<li>2. Right-click the folder → Share → Change access to "Anyone with the link"</li>
				<li>3. Copy the link and paste it above</li>
			</ol>
		</div>
	</main>
</div>
