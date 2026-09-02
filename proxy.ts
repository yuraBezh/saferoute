import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((request) => {
	if (!request.auth) {
		const signInUrl = new URL('/signin', request.nextUrl.origin);
		return NextResponse.redirect(signInUrl);
	}
});

export const config = {
	matcher: ['/children/:path*', '/locations/:path*', '/caregiver/:path*'],
};
