import { ChildForm } from '@/components/child-form';
import { createChildFormText } from '@/lib/content/child-form-text';
import { createChildAction } from '@/app/children/actions';
import { PageTitle } from '@/components/ui/page-title';
import { PageDescription } from '@/components/ui/page-description';
import { PageContainer } from '@/components/ui/page-container';
import { childrenText } from '@/lib/content/children-text';
import { BackLink } from '@/components/ui/back-link';

export default function AddNewChildrenPage() {
	const defaultValues = { firstName: '', lastName: '', birthDate: '' };
	const { title, description, submit, submitting } = createChildFormText;

	return (
		<PageContainer size="form">
			<BackLink href="/children" className="mb-5">
				{childrenText.title}
			</BackLink>

			<header className="mb-5">
				<PageTitle>{title}</PageTitle>
				<PageDescription>{description}</PageDescription>
			</header>

			<ChildForm
				formAction={createChildAction}
				submitLabel={submit}
				submittingLabel={submitting}
				defaultValues={defaultValues}
				cancelHref="/children"
				showRelationship
			/>
		</PageContainer>
	);
}
