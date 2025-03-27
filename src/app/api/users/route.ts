import { NextResponse } from 'next/server';
import { VALID_USERS } from '@/lib/auth';

export async function GET() {
    const usersArray = Object.values(VALID_USERS).map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
    return NextResponse.json(usersArray);
}
