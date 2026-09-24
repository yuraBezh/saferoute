export const childrenText = {
	title: 'Children',
	description: 'Manage the children in your care.',
	addChild: 'Add child',
	yearsOld: 'years old',
	guardianCount: (count: number) => `${count} ${count === 1 ? 'guardian' : 'guardians'}`,
} as const;
