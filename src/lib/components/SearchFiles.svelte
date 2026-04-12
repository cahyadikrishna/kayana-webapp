<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	/** Two-way bound search query string. */
	export let query = '';

	function clear() {
		query = '';
	}
</script>

<div class="relative w-full max-w-md">
	<Search
		class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
		aria-hidden="true"
	/>
	<Input
		type="search"
		placeholder="Search photos…"
		bind:value={query}
		class="pl-9 pr-9"
		aria-label="Search photos by name"
	/>
	{#if query}
		<button
			type="button"
			class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
			aria-label="Clear search"
			on:click={clear}
		>
			<X class="h-4 w-4" />
		</button>
	{/if}
</div>
