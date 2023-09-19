import { sequence } from '@sveltejs/kit/hooks';

import { remultSveltekit } from 'remult/remult-sveltekit';
import { Task } from './shared/Task';
import { TaskController } from './shared/TaskController';
import { createPostgresDataProvider } from 'remult/postgres';

import { SvelteKitAuth } from '@auth/sveltekit';
import CredentialsProvider from '@auth/core/providers/credentials';
import { DATABASE_URL, NEXTAUTH_SECRET } from '$env/static/private';
import type { UserInfo } from 'remult';

const usersDB = [
	{ id: '1', name: 'jane', roles: ['admin'] },
	{ id: '2', name: 'steve', roles: [] }
];

function findUser(name?: string | null) {
	return usersDB.find((user) => user.name.toLowerCase() === name?.toLowerCase());
}

const handleRemult = remultSveltekit({
	entities: [Task],
	controllers: [TaskController],
	getUser: async (event) => ((await event.locals?.getSession())?.user as UserInfo) || undefined,
	dataProvider: createPostgresDataProvider({
		connectionString: DATABASE_URL
	})
});

const handleAuth = SvelteKitAuth({
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				name: { label: 'Name', type: 'text', placeholder: 'Try steve or jane' }
			},
			authorize: (credentials) => findUser(credentials?.name as string) || null
		})
	],
	trustHost: true,
	secret: NEXTAUTH_SECRET,
	callbacks: {
		session: ({ session }) => ({ ...session, user: findUser(session.user?.name) })
	}
});

export const handle = sequence(handleAuth, handleRemult);
