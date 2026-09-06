<script lang="ts">
	import CreateUserForm from './create-user-form.svelte';

	let userWasCreated = $state(false);
</script>

{#if !userWasCreated}
	<CreateUserForm createSuccessful={() => (userWasCreated = true)} />
{:else}
	<p>User was successfully created!</p>
{/if}
