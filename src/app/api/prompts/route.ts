import { NextResponse } from 'next/server';

export async function POST(request: Request) {
}

export async function GET() {
    try {
        // NOTE: This is a temporary implementation using localStorage which is client-side.
        // This needs to be replaced with a proper backend storage solution (like IndexedDB client-side or a server-side database).
        let savedPrompts = [];
        if (typeof window !== 'undefined') {
            const storedPrompts = localStorage.getItem('savedPrompts');
            if (storedPrompts) {
                savedPrompts = JSON.parse(storedPrompts);
            }
        }

        return NextResponse.json({ data: savedPrompts, status: 'succeeded' });
    } catch (error) {
        console.error('Error retrieving prompts:', error);
        return NextResponse.json({ message: 'Error retrieving prompts', status: 'error' }, { status: 500 });
    }
}
