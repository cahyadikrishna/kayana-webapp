<script lang="ts">
	import { Camera, Users, LayoutDashboard } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { APP_NAME } from '$lib/utils/constants.js';
</script>

<svelte:head>
	<title>{APP_NAME} – Photo Selection</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-16">
	<div class="mx-auto max-w-2xl text-center">
		<!-- Logo / Icon -->
		<div class="mb-6 flex justify-center">
			<div class="rounded-2xl bg-primary p-4">
				<Camera class="h-10 w-10 text-primary-foreground" aria-hidden="true" />
			</div>
		</div>

		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{APP_NAME}</h1>
		<p class="mt-4 text-lg text-muted-foreground">
			A simple, beautiful way to select photos from a gallery and share your choices.
		</p>

		<div class="mt-10 grid gap-4 sm:grid-cols-2">
			<div class="rounded-lg border bg-card p-6 text-left shadow-sm">
				<Users class="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
				<h2 class="font-semibold">For clients</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Open your unique link, browse the photo gallery, select your favourites, and submit — no
					account needed.
				</p>
			</div>
			<div class="rounded-lg border bg-card p-6 text-left shadow-sm">
				<LayoutDashboard class="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
				<h2 class="font-semibold">For photographers</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Create a session with a Google Drive folder link, share the client URL, and review
					submissions from the admin dashboard.
				</p>
			</div>
		</div>

		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<Button href="/admin" size="lg">
				<LayoutDashboard class="mr-2 h-5 w-5" />
				Go to Admin
			</Button>
		</div>
	</div>
</main>
