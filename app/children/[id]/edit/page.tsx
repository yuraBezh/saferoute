import { ChildForm } from '@/components/child-form';
import { PageTitle } from '@/components/ui/page-title';
import { PageDescription } from '@/components/ui/page-description';
import { PageContainer } from '@/components/ui/page-container';
import { notFound } from 'next/navigation';
import { editChildAction } from '@/app/children/actions';
import { editChildFormText } from '@/lib/content/child-form-text';
import { BackLink } from '@/components/ui/back-link';
import { getChildForCurrentUser } from '@/lib/data/children';
import { fromDbDate } from '@/lib/date';

const { title, description, submit, submitting } = editChildFormText;

export default async function EditChildrenPage({ params }: PageProps<'/children/[id]/edit'>) {
	const { id } = await params;

	const child = await getChildForCurrentUser(id);
	if (!child) notFound();

	const action = editChildAction.bind(null, id);
	const fullName = `${child.firstName} ${child.lastName}`;

	const preFillValue = {
		firstName: child.firstName,
		lastName: child.lastName,
		birthDate: fromDbDate(child.birthDate),
	};

	return (
		<PageContainer size="form">
			<BackLink href={`/children/${id}`} className="mb-5">
				{fullName}
			</BackLink>

			<header className="mb-5">
				<PageTitle>{title}</PageTitle>
				<PageDescription>{description(fullName)}</PageDescription>
			</header>

			<ChildForm
				formAction={action}
				preFillValue={preFillValue}
				submitLabel={submit}
				submittingLabel={submitting}
				cancelHref={`/children/${id}`}
			/>
		</PageContainer>
	);
}
