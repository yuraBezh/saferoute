import { signIn } from '@/auth';

const signInAction = async () => {
	'use server';
	await signIn('google', { redirectTo: '/children' });
};

export default function SignInPage() {
	return (
		<main className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
				<h1 className="text-2xl font-semibold tracking-tight text-gray-950">
					Sign in to SafeRoute
				</h1>
				<p className="mt-2 text-sm leading-6 text-gray-600">
					Book a verified caregiver for your child and follow every trip live.
				</p>

				<form className="mt-6" action={signInAction}>
					<button
						type="submit"
						className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
					>
						Continue with Google
					</button>
				</form>
			</div>
		</main>
	);
}
