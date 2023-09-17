<script lang="ts">
	import { remult } from 'remult';
	import { Task } from '../shared/Task';
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { TaskController } from '../shared/TaskController';

	export let data;
	export let form;

	const taskRepo = remult.repo(Task);
	let unSub = () => {};
	//$: tasks = data.tasks;
	let tasks: Task[] = [];
	let user = data?.session?.user;

	onMount(() => {
		if (browser) {
			unSub = taskRepo.liveQuery(data.options).subscribe((info) => {
				console.log('INFO:', info);
				tasks = info.applyChanges(tasks);
			});
		} else {
			//tasks = data.tasks;
		}
	});

	onDestroy(() => {
		if (browser) unSub();
	});

	async function setAllCompleted(completed: boolean) {
		await TaskController.setAllCompleted(completed);
	}

	/* const options = data.options;
	$page.query.set('limit', options.limit);
	history.replaceState(history.state, '', $page.url); */
</script>

<svelte:head>
	<title>Remult+Sveltekit Todo App</title>
</svelte:head>

<div>
	<h1>todos</h1>
	<main>
		<div>
			{#if user}
				<h4>
					Welcome back, {user.name}
					{#if user?.roles.includes('admin')}
						[admin]
					{/if}
				</h4>
				<a href="/auth/signout">Sign Out</a>
			{:else}
				<h4>You are not Signed In</h4>
				<a href="/auth/signin">Sign In</a>
			{/if}
		</div>
		<form method="POST" action="?/addTask" use:enhance>
			<input name="newTaskTitle" placeholder="What needs to be done?" />
			<button>Add</button>
		</form>

		{#if form?.success}
			<div class="alert alert-success">{form.message}</div>
		{/if}

		{#if form?.error}
			<div class="alert alert-error">{form.error}</div>
		{/if}

		{#each tasks as task (task.id)}
			<form method="POST">
				<input
					type="checkbox"
					name="completed"
					bind:checked={task.completed}
					value={task.completed}
				/>
				<input name="title" type="text" bind:value={task.title} />
				<input name="id" type="hidden" value={task.id} />
				<button formaction="?/saveTask">Save</button>
				<button formaction="?/deleteTask">Delete</button>
			</form>
		{/each}

		<div>
			<button on:click={() => setAllCompleted(true)}>Set all as Completed</button>
			<button on:click={() => setAllCompleted(false)}>Set all as Incomplete</button>
		</div>
		<!-- <form method="POST" use:enhance>
			<button formaction="?/setAllComplete">Set all as Completed</button>
			<button formaction="?/setAllInComplete">Set all as Incomplete</button>
		</form> -->
	</main>
</div>
