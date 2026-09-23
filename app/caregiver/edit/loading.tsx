import { FormPageSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return <FormPageSkeleton fields={7} backLink={false} description={false} />;
}
