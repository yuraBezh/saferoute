import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';

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
					<Button type="submit" variant="secondary" className="w-full">
						Continue with Google
					</Button>
				</form>
			</div>
		</main>
	);
}
