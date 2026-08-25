import type { ComponentProps } from 'react';
import { FORM_CONTROL_CLASS_NAME } from '@/components/ui/form-control';

export function Input(props: Omit<ComponentProps<'input'>, 'className'>) {
	return (
		<input
			className={`${FORM_CONTROL_CLASS_NAME} placeholder:text-gray-400`}
			{...props}
		/>
	);
}
