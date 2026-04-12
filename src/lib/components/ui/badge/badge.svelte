<script lang="ts">
	import { cn } from '$lib/utils/helpers.js';
	import { badgeVariants, type Props } from './index.js';

	type $$Props = Props;
	export let variant: Props['variant'] = 'default';
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div class={cn(badgeVariants({ variant }), className)} {...$$restProps}>
	<slot />
</div>
