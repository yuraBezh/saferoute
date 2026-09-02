import { GuardianRelationship } from '@/generated/prisma/enums';
import {
	childFormText,
	guardianRelationshipLabels,
} from '@/lib/content/child-form-text';
import { SelectField } from '@/components/ui/select-field';

const relationshipOptions = Object.values(GuardianRelationship);

export function RelationshipField({ error }: { error?: string }) {
	return (
		<SelectField
			id="relationship"
			name="relationship"
			label={childFormText.fields.relationship.label}
			error={error}
			defaultValue=""
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
