export const childrenText = {
	title: 'Children',
	addChild: 'Add child',
	yearsOld: 'years old',
	childCount: (count: number) =>
		`${count} ${count === 1 ? 'child' : 'children'}`,
	guardianCount: (count: number) =>
		`${count} ${count === 1 ? 'guardian' : 'guardians'}`,
} as const;
