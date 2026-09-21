import { GuardianRelationship } from '@/generated/prisma/enums';
import type { ChangeEventHandler } from 'react';
import { childFormText, guardianRelationshipLabels } from '@/lib/content/child-form-text';
import { SelectField } from '@/components/ui/select-field';

const relationshipOptions = Object.values(GuardianRelationship);

type RelationshipFieldProps = {
	error?: string;
	value: string;
	onChange: ChangeEventHandler<HTMLSelectElement>;
};

export function RelationshipField({ error, value, onChange }: RelationshipFieldProps) {
	return (
		<SelectField
			id="relationship"
			name="relationship"
			label={childFormText.fields.relationship.label}
			error={error}
			value={value}
			onChange={onChange}
			required
		>
			<option value="" disabled>
				Select…
			</option>
			{relationshipOptions.map((relationship) => (
				<option key={relationship} value={relationship}>
					{guardianRelationshipLabels[relationship]}
				</option>
			))}
		</SelectField>
	);
}
