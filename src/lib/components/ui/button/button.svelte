<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { type Props, buttonVariants } from './index.js';
	import { cn } from '$lib/utils/helpers.js';

	let { variant = 'default', size = 'default', class: className, children, ...restProps }: Props = $props();
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</ButtonPrimitive.Root>
