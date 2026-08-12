import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuardianRelationship } from '@/app/generated/prisma/enums';
import { childDetailsText } from '@/lib/content/child-details-text';
import { GuardiansList } from './guardians-list';

const { empty, primary, canBook, viewOnly, details, relationships } =
	childDetailsText.guardians;

const motherFixture = {
	id: 'guardian-1',
	relationship: GuardianRelationship.MOTHER,
	isPrimary: true,
	canBook: true,
	user: {
		fullName: 'Hanna Krasinski',
		email: 'hanna@example.com',
	},
};

const fatherFixture = {
	...motherFixture,
	id: 'guardian-2',
	relationship: GuardianRelationship.FATHER,
	user: { fullName: 'Father', email: 'father@example.com' },
};

const guardianFixture = {
	...motherFixture,
	id: 'guardian-3',
	relationship: GuardianRelationship.GUARDIAN,
	user: { fullName: 'Guardian', email: 'guardian@example.com' },
};

const otherFixture = {
	...motherFixture,
	id: 'guardian-4',
	relationship: GuardianRelationship.OTHER,
	user: { fullName: 'Other', email: 'other@example.com' },
};

describe('GuardiansList', () => {
	it('shows an empty state when there are no guardians', () => {
		render(<GuardiansList guardians={[]} />);

		expect(screen.getByText(empty)).toBeDefined();
	});

	it('shows the guardian name, relationship, and email', () => {
		render(<GuardiansList guardians={[motherFixture]} />);

		expect(screen.getByText(motherFixture.user.fullName)).toBeDefined();
		expect(
			screen.getByText(details(relationships.MOTHER, motherFixture.user.email)),
		).toBeDefined();
	});

	it('shows Primary for the primary guardian', () => {
		render(<GuardiansList guardians={[motherFixture]} />);

		expect(screen.getByText(primary)).toBeDefined();
	});

	it('hides Primary for a secondary guardian', () => {
		render(
			<GuardiansList guardians={[{ ...motherFixture, isPrimary: false }]} />,
		);

		expect(screen.queryByText(primary)).toBeNull();
	});

	it('shows Can book when booking is allowed', () => {
		render(<GuardiansList guardians={[motherFixture]} />);

		expect(screen.getByText(canBook)).toBeDefined();
	});

	it('shows View only when booking is not allowed', () => {
		render(
			<GuardiansList guardians={[{ ...motherFixture, canBook: false }]} />,
		);

		expect(screen.getByText(viewOnly)).toBeDefined();
		expect(screen.queryByText(canBook)).toBeNull();
	});

	it('shows every supported relationship label', () => {
		render(
			<GuardiansList
				guardians={[
					motherFixture,
					fatherFixture,
					guardianFixture,
					otherFixture,
				]}
			/>,
		);

		expect(
			screen.getByText(details(relationships.MOTHER, motherFixture.user.email)),
		).toBeDefined();
		expect(
			screen.getByText(details(relationships.FATHER, fatherFixture.user.email)),
		).toBeDefined();
		expect(
			screen.getByText(
				details(relationships.GUARDIAN, guardianFixture.user.email),
			),
		).toBeDefined();
		expect(
			screen.getByText(details(relationships.OTHER, otherFixture.user.email)),
		).toBeDefined();
	});
});
