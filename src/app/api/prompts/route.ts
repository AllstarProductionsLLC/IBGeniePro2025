import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // This is a temporary client-side implementation.
    // In a real app, this logic would be in a serverless function connecting to a database.
    try {
        if (typeof window !== 'undefined') {
            const newPrompt = await request.json();
            const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
            savedPrompts.push(newPrompt);
            localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
            return NextResponse.json({ message: 'Prompt saved successfully', status: 'succeeded', data: newPrompt });
        }
        return NextResponse.json({ message: 'Local storage not available', status: 'error' }, { status: 500 });
    } catch (error) {
        console.error('Error saving prompt:', error);
        return NextResponse.json({ message: 'Error saving prompt', status: 'error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // NOTE: This is a temporary implementation using localStorage which is client-side.
        // This needs to be replaced with a proper backend storage solution (like IndexedDB client-side or a server-side database).
        if (typeof window !== 'undefined') {
            const storedPrompts = localStorage.getItem('savedPrompts');
            const savedPrompts = storedPrompts ? JSON.parse(storedPrompts) : [];
            return NextResponse.json({ data: savedPrompts, status: 'succeeded' });
        }
         return NextResponse.json({ data: [], status: 'succeeded' });
    } catch (error) {
        console.error('Error retrieving prompts:', error);
        return NextResponse.json({ message: 'Error retrieving prompts', status: 'error' }, { status: 500 });
    }
}
