import { ChildForm } from '@/components/child-form';
import { createChildFormText } from '@/lib/content/child-form-text';
import { createChildAction } from '@/app/children/actions';
import { PageTitle } from '@/components/ui/page-title';
import { childrenText } from '@/lib/content/children-text';
import { BackLink } from '@/components/ui/back-link';

export default function AddNewChildrenPage() {
	const defaultValues = { firstName: '', lastName: '', birthDate: '' };
	const { title, description, submit, submitting } = createChildFormText;

	return (
		<main className="min-h-screen bg-white py-6 text-gray-950 sm:py-8">
			<div className="mx-auto w-full max-w-xl px-4 sm:px-6">
				<BackLink href="/children" className="mb-5">
					{childrenText.title}
				</BackLink>

				<header className="mb-5">
					<PageTitle>{title}</PageTitle>
					<p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
				</header>

				<ChildForm
					formAction={createChildAction}
					submitLabel={submit}
					submittingLabel={submitting}
					defaultValues={defaultValues}
					cancelHref="/children"
					showRelationship
				/>
			</div>
		</main>
	);
}
