import { remult, type FindOptions } from 'remult';
import { Task } from '../shared/Task';
import { fail } from '@sveltejs/kit';

const taskRepo = remult.repo(Task);

export const load = async ({ url }) => {
	const orderDir = url.searchParams.get('orderDir') || 'asc';
	const completed = Boolean(url.searchParams.get('completed')) || undefined;

	const options: FindOptions<Task> = {
		orderBy: { createdAt: orderDir },
		limit: parseInt(url.searchParams.get('limit') || '20'),
		where: {
			completed
		}
	};

	const tasks: Task[] = [];

	try {
		const tasks = await taskRepo.find(options);
	} catch (error) {
		console.log(error);
		return fail(400, { error: (error as { message: string }).message });
	}

	return {
		tasks: structuredClone(tasks),
		options
	};
};

export const actions = {
	addTask: async ({ request }) => {
		try {
			if (!remult.user?.roles?.includes('admin')) {
				return fail(400, { error: 'not allowed' });
			}
			const formData = await request.formData();
			const newTaskTitle = formData.get('newTaskTitle') as string;
			const newTask = await taskRepo.insert({ title: newTaskTitle });
			return {
				success: true,
				message: 'Task added succesfully',
				newTask: structuredClone(newTask)
			};
		} catch (error) {
			return fail(400, { error: (error as { message: string }).message });
		}
	},

	deleteTask: async ({ request }) => {
		try {
			const formData = await request.formData();
			const id = formData.get('id') as string;
			await taskRepo.delete(id);
			return {
				success: true,
				message: 'Task deleted succesfully'
			};
		} catch (error) {
			return fail(400, { error: (error as { message: string }).message });
		}
	},

	saveTask: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const title = formData.get('title') as string;
		const completed = (formData.get('completed') as unknown as boolean) || undefined;
		try {
			taskRepo.update(id, { title, completed });
			return {
				success: true,
				message: 'Task updated succesfully'
			};
		} catch (error) {
			return fail(400, { error: (error as { message: string }).message });
		}
	}

	/* setAllComplete: async () => {
		try {
			for (const task of await taskRepo.find()) {
				await taskRepo.update(task.id, { completed: true });
			}

			return {
				success: true,
				message: 'All tasks are completed'
			};
		} catch (error) {
			return fail(400, { error: (error as { message: string }).message });
		}
	},

	setAllInComplete: async () => {
		try {
			for (const task of await taskRepo.find()) {
				await taskRepo.update(task.id, { completed: false });
			}

			return {
				success: true,
				message: 'All tasks have been marked in-complete'
			};
		} catch (error) {
			return fail(400, { error: (error as { message: string }).message });
		}
	} */
};
