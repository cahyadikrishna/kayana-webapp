<script lang="ts">
	import { Copy, ExternalLink, PlusCircle, Users, Calendar, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatDate } from '$lib/utils/helpers.js';
	import { APP_NAME } from '$lib/utils/constants.js';
	import type { PageData } from './$types';

	export let data: PageData;

	async function copyLink(sessionId: string) {
		const url = `${window.location.origin}/select/${sessionId}`;
		await navigator.clipboard.writeText(url);
		toast.success('Link copied to clipboard');
	}
</script>

<svelte:head>
	<title>Admin Dashboard – {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<header class="border-b bg-background">
		<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
			<div>
				<h1 class="text-xl font-bold">{APP_NAME} Admin</h1>
				<p class="text-sm text-muted-foreground">Manage photo selection sessions</p>
			</div>
			<Button href="/admin/create-session">
				<PlusCircle class="mr-2 h-4 w-4" />
				New session
			</Button>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
		{#if data.sessions.length === 0}
			<div class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center">
				<Users class="h-12 w-12 text-muted-foreground" aria-hidden="true" />
				<div>
					<p class="font-semibold text-lg">No sessions yet</p>
					<p class="mt-1 text-sm text-muted-foreground">
						Create your first session to get started
					</p>
				</div>
				<Button href="/admin/create-session">
					<PlusCircle class="mr-2 h-4 w-4" />
					Create session
				</Button>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.sessions as session (session.id)}
					<div class="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<h2 class="font-semibold truncate">{session.name}</h2>
									<Badge variant="secondary">
										<Users class="mr-1 h-3 w-3" />
										{session.submission_count}
										{session.submission_count === 1 ? 'submission' : 'submissions'}
									</Badge>
								</div>
								<p class="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
									<Calendar class="h-3 w-3" aria-hidden="true" />
									Created {formatDate(session.created_at)}
								</p>
								<p class="mt-0.5 truncate text-xs text-muted-foreground">
									Folder ID: {session.drive_folder_id}
								</p>
							</div>

							<div class="flex shrink-0 flex-wrap gap-2">
								<Button
									variant="outline"
									size="sm"
									onclick={() => copyLink(session.id)}
									aria-label={`Copy client link for ${session.name}`}
								>
									<Copy class="mr-1.5 h-3.5 w-3.5" />
									Copy link
								</Button>
								<Button
									variant="outline"
									size="sm"
									href="/select/{session.id}"
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Open client view for ${session.name}`}
								>
									<ExternalLink class="mr-1.5 h-3.5 w-3.5" />
									Preview
								</Button>
								<Button
									variant="outline"
									size="sm"
									href={session.drive_folder_url}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Open Google Drive folder for ${session.name}`}
								>
									Drive
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>
