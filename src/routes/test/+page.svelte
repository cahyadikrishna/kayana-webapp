<script lang="ts">
	import { Search, RefreshCw, AlertCircle, Info, FolderOpen } from 'lucide-svelte';
	import FileGallery from '$lib/components/FileGallery.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { GoogleDriveFile } from '$lib/types/index.js';
	import { APP_NAME } from '$lib/utils/constants.js';

	let folderUrl = '';
	let loading = false;
	let files: GoogleDriveFile[] = [];
	let folderId = '';
	let errorMsg = '';
	let fetched = false;

	async function fetchFiles() {
		const trimmed = folderUrl.trim();
		if (!trimmed) return;

		loading = true;
		errorMsg = '';
		files = [];
		fetched = false;

		try {
			const res = await fetch(`/api/test-drive?folderUrl=${encodeURIComponent(trimmed)}`);
			const data = (await res.json()) as {
				files?: GoogleDriveFile[];
				folderId?: string;
				total?: number;
				message?: string;
			};

			if (!res.ok) {
				errorMsg = data.message ?? `Error ${res.status}`;
				return;
			}

			files = data.files ?? [];
			folderId = data.folderId ?? '';
			fetched = true;
		} catch {
			errorMsg = 'Network error — is the dev server running?';
		} finally {
			loading = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter') fetchFiles();
	}
</script>

<svelte:head>
	<title>Drive Test – {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<header class="border-b bg-background">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-lg font-bold">Drive Fetch Test</h1>
						<Badge variant="secondary" class="text-xs">Dev only</Badge>
					</div>
					<p class="text-sm text-muted-foreground">
						Validate Google Drive access and preview the gallery UI — no Supabase required
					</p>
				</div>
				<Button variant="outline" size="sm" href="/">← Home</Button>
			</div>
		</div>
	</header>

	<!-- URL input bar -->
	<div class="border-b bg-muted/30">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<div class="flex gap-2">
				<div class="relative flex-1">
					<FolderOpen
						class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						type="url"
						placeholder="https://drive.google.com/drive/folders/…"
						bind:value={folderUrl}
						class="pl-9"
						aria-label="Google Drive folder URL"
						on:keydown={handleKey}
					/>
				</div>
				<Button onclick={fetchFiles} disabled={loading || !folderUrl.trim()}>
					{#if loading}
						<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
						Fetching…
					{:else}
						<Search class="mr-2 h-4 w-4" />
						Fetch files
					{/if}
				</Button>
			</div>

			<!-- Hint -->
			<p class="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
				<Info class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
				Requires <code class="rounded bg-muted px-1 py-0.5 font-mono">GOOGLE_API_KEY</code> in
				<code class="rounded bg-muted px-1 py-0.5 font-mono">.env.local</code>. The Drive folder
				must be shared as "Anyone with the link".
			</p>
		</div>
	</div>

	<!-- Results area -->
	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Error state -->
		{#if errorMsg}
			<div
				class="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4"
				role="alert"
			>
				<AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
				<div>
					<p class="font-medium text-destructive">Failed to fetch files</p>
					<p class="mt-0.5 text-sm text-destructive/80">{errorMsg}</p>
				</div>
			</div>
		{/if}

		<!-- Success metadata bar -->
		{#if fetched && !errorMsg}
			<div class="mb-4 flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
				<span class="text-sm font-medium">
					{files.length} image{files.length === 1 ? '' : 's'} fetched
				</span>
				<span class="text-muted-foreground">·</span>
				<span class="font-mono text-xs text-muted-foreground">folder: {folderId}</span>
			</div>
		{/if}

		<!-- Gallery (reuses the same component as the real app) -->
		{#if fetched || loading}
			<FileGallery {files} {loading} />
		{:else if !errorMsg}
			<!-- Idle state -->
			<div
				class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-24 text-center"
			>
				<FolderOpen class="h-12 w-12 text-muted-foreground" aria-hidden="true" />
				<div>
					<p class="font-semibold text-lg">No folder loaded yet</p>
					<p class="mt-1 text-sm text-muted-foreground max-w-xs">
						Paste a public Google Drive folder URL above and click "Fetch files" to preview the
						gallery
					</p>
				</div>
			</div>
		{/if}
	</main>
</div>
