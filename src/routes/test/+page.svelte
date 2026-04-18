<script lang="ts">
	import { Search, RefreshCw, AlertCircle, Info, FolderOpen, ListChecks, X, Send } from 'lucide-svelte';
	import FileGallery from '$lib/components/FileGallery.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { selections, selectedFiles, selectedCount } from '$lib/stores/selections.js';
	import type { GoogleDriveFile } from '$lib/types/index.js';
	import { APP_NAME } from '$lib/utils/constants.js';
	import { PUBLIC_ADMIN_WA_PHONE } from '$env/static/public';

	let folderUrl = '';
	let loading = false;
	let isLoadingMore = false;
	let files: GoogleDriveFile[] = [];
	let folderId = '';
	let errorMsg = '';
	let fetched = false;
	let pageToken: string | null = null;
	let hasMore = false;
	let total: number | null = null;

	let modalOpen = false;

	async function fetchFiles() {
		const trimmed = folderUrl.trim();
		if (!trimmed) return;

		loading = true;
		errorMsg = '';
		files = [];
		fetched = false;
		pageToken = null;
		hasMore = false;
		total = null;
		selections.clear();

		try {
			const res = await fetch(
				`/api/test-drive?folderUrl=${encodeURIComponent(trimmed)}&pageSize=50`
			);
			const data = (await res.json()) as {
				files?: GoogleDriveFile[];
				folderId?: string;
				pageToken?: string | null;
				hasMore?: boolean;
				total?: number;
				message?: string;
			};

			if (!res.ok) {
				errorMsg = data.message ?? `Error ${res.status}`;
				return;
			}

			files = data.files ?? [];
			folderId = data.folderId ?? '';
			pageToken = data.pageToken ?? null;
			hasMore = data.hasMore ?? false;
			total = data.total ?? null;
			fetched = true;
		} catch {
			errorMsg = 'Network error — is the dev server running?';
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		if (isLoadingMore || !hasMore || !pageToken) return;

		isLoadingMore = true;

		try {
			const res = await fetch(
				`/api/test-drive?folderUrl=${encodeURIComponent(folderUrl.trim())}&pageSize=50&pageToken=${encodeURIComponent(pageToken)}`
			);
			const data = (await res.json()) as {
				files?: GoogleDriveFile[];
				pageToken?: string | null;
				hasMore?: boolean;
				message?: string;
			};

			if (!res.ok) {
				errorMsg = data.message ?? `Error ${res.status}`;
				return;
			}

			files = [...files, ...(data.files ?? [])];
			pageToken = data.pageToken ?? null;
			hasMore = data.hasMore ?? false;
		} catch {
			errorMsg = 'Network error while loading more';
		} finally {
			isLoadingMore = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter') fetchFiles();
	}

	function buildWhatsAppUrl(): string {
		const lines = $selectedFiles
			.map((f, i) => `${i + 1}. ${f.file_name}`)
			.join('\n');
		const text = `Halo, berikut file yang saya pilih:\n\n${lines}`;
		return `https://api.whatsapp.com/send/?phone=${PUBLIC_ADMIN_WA_PHONE}&text=${encodeURIComponent(text)}`;
	}

	function handleModalKey(e: KeyboardEvent) {
		if (e.key === 'Escape') modalOpen = false;
	}
</script>

<svelte:head>
	<title>Drive Test – {APP_NAME}</title>
</svelte:head>

<svelte:window on:keydown={handleModalKey} />

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
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<input
						type="url"
						placeholder="https://drive.google.com/drive/folders/…"
						bind:value={folderUrl}
						class="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						aria-label="Google Drive folder URL"
						onkeydown={handleKey}
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
					{#if total !== null}
						{files.length} / {total} photo{total === 1 ? '' : 's'} loaded
					{:else}
						{files.length} photo{files.length === 1 ? '' : 's'} loaded
					{/if}
				</span>
				<span class="text-muted-foreground">·</span>
				<span class="font-mono text-xs text-muted-foreground">folder: {folderId}</span>
			</div>
		{/if}

		<!-- Gallery -->
		{#if fetched || loading}
			<FileGallery {files} {loading} {isLoadingMore} {hasMore} onLoadMore={loadMore} />
		{:else if !errorMsg}
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

		<!-- Bottom spacer so the floating bar doesn't hide the last row -->
		{#if $selectedCount > 0}
			<div class="h-24" aria-hidden="true"></div>
		{/if}
	</main>
</div>

<!-- ── Floating selection bar ── -->
{#if $selectedCount > 0}
	<div
		class="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 shadow-lg backdrop-blur-sm"
		role="region"
		aria-label="Selected files"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
			<div class="flex items-center gap-3">
				<Badge class="tabular-nums text-sm px-3 py-1">
					{$selectedCount} selected
				</Badge>
				<p class="hidden text-sm text-muted-foreground sm:block">
					Click "Review" to see the list and send to admin
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="sm" onclick={() => selections.clear()}>
					Clear
				</Button>
				<Button onclick={() => (modalOpen = true)}>
					<ListChecks class="mr-2 h-4 w-4" />
					Review & Send
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- ── Selected files modal ── -->
{#if modalOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && (modalOpen = false)}
	>
		<div
			class="relative w-full max-w-md rounded-t-2xl border bg-background shadow-2xl sm:rounded-2xl"
			role="dialog"
			aria-modal="true"
			aria-label="Selected files"
		>
			<!-- Modal header -->
			<div class="flex items-center justify-between border-b px-5 py-4">
				<div>
					<h2 class="font-semibold text-base">Selected files</h2>
					<p class="text-xs text-muted-foreground mt-0.5">
						{$selectedCount} file{$selectedCount === 1 ? '' : 's'} chosen
					</p>
				</div>
				<button
					type="button"
					class="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					aria-label="Close"
					onclick={() => (modalOpen = false)}
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- File list -->
			<ul
				class="max-h-64 overflow-y-auto divide-y px-5"
				aria-label="Selected file names"
			>
				{#each $selectedFiles as sel, i (sel.file_id)}
					<li class="flex items-center gap-3 py-2.5">
						<span class="text-xs font-mono text-muted-foreground w-5 shrink-0 text-right">
							{i + 1}
						</span>
						<span class="truncate text-sm" title={sel.file_name}>{sel.file_name}</span>
						<button
							type="button"
							class="ml-auto shrink-0 text-muted-foreground hover:text-foreground focus:outline-none rounded"
							aria-label="Remove {sel.file_name}"
							onclick={() => selections.remove(sel.file_id)}
						>
							<X class="h-3.5 w-3.5" />
						</button>
					</li>
				{/each}
			</ul>

			<!-- Modal footer -->
			<div class="flex items-center justify-between gap-3 border-t px-5 py-4">
				<button
					type="button"
					class="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
					onclick={() => (modalOpen = false)}
				>
					Close
				</button>
				<a
					href={buildWhatsAppUrl()}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1ebe5d] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 transition-colors"
					aria-label="Send selection to admin via WhatsApp"
				>
					<Send class="h-4 w-4" />
					Send to Admin via WhatsApp
				</a>
			</div>
		</div>
	</div>
{/if}
