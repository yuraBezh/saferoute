import { UserRole } from '@/generated/prisma/enums';
import { PageTitle } from '@/components/ui/page-title';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { requireRole } from '@/lib/auth/roles';
import { caregiverText } from '@/lib/content/caregiver-text';

export default async function AssignmentsPage() {
	await requireRole(UserRole.CAREGIVER);

	return (
		<PageContainer>
			<header>
				<PageTitle>{caregiverText.assignments.title}</PageTitle>
				<PageDescription>{caregiverText.assignments.description}</PageDescription>
			</header>
		</PageContainer>
	);
}
