import { ChildForm } from '@/components/child-form';
import { PageTitle } from '@/components/ui/page-title';
import { notFound } from 'next/navigation';
import { editChildAction } from '@/app/children/actions';
import { editChildFormText } from '@/lib/content/child-form-text';
import { BackLink } from '@/components/ui/back-link';
import { getChildForCurrentUser } from '@/lib/data/children';

const { title, description, submit, submitting } = editChildFormText;

export default async function EditChildrenPage({
	params,
}: PageProps<'/children/[id]/edit'>) {
	const { id } = await params;

	const child = await getChildForCurrentUser(id);
	if (!child) notFound();

	const action = editChildAction.bind(null, id);
	const fullName = `${child.firstName} ${child.lastName}`;

	const defaultValues = {
		firstName: child.firstName,
		lastName: child.lastName,
		birthDate: child.birthDate.toISOString().slice(0, 10),
	};

	return (
		<main className="min-h-screen bg-white py-6 text-gray-950 sm:py-8">
			<div className="mx-auto w-full max-w-xl px-4 sm:px-6">
				<BackLink href={`/children/${id}`} className="mb-5">
					{fullName}
				</BackLink>

				<header className="mb-5">
					<PageTitle>{title}</PageTitle>
					<p className="mt-1 text-sm leading-6 text-gray-600">
						{description(fullName)}
					</p>
				</header>

				<ChildForm
					formAction={action}
					defaultValues={defaultValues}
					submitLabel={submit}
					submittingLabel={submitting}
					cancelHref={`/children/${id}`}
				/>
			</div>
		</main>
	);
}
