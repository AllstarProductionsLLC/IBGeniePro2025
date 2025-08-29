import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // In a real application, you would retrieve the prompt from a database by ID
    // This is a temporary client-side implementation within a server-side route
    if (typeof window !== 'undefined') {
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
      const prompt = savedPrompts.find((p: any) => p.id === id); // Assuming prompts have an 'id'

      if (prompt) {
        return NextResponse.json(prompt);
      } else {
        return NextResponse.json({ message: 'Prompt not found', status: 'error' }, { status: 404 });
      }
    }

    // If window is not defined (server-side), return an error or handle accordingly
    return NextResponse.json({ message: 'Local storage not available', status: 'error' }, { status: 500 });

  } catch (error) {
    console.error('Error retrieving prompt:', error);
    return NextResponse.json({ message: 'Error retrieving prompt', status: 'error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedPromptData = await request.json();

    // In a real application, you would update the prompt in a database by ID
    // This is a temporary client-side implementation within a server-side route
    if (typeof window !== 'undefined') {
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
      const promptIndex = savedPrompts.findIndex((p: any) => p.id === id);

      if (promptIndex !== -1) {
        // Update the prompt data
        savedPrompts[promptIndex] = { ...savedPrompts[promptIndex], ...updatedPromptData, updatedAt: Date.now() };
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
        return NextResponse.json({ message: 'Prompt updated successfully', status: 'succeeded' });
      } else {
        return NextResponse.json({ message: 'Prompt not found', status: 'error' }, { status: 404 });
      }
    }

    return NextResponse.json({ message: 'Local storage not available', status: 'error' }, { status: 500 });

  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ message: 'Error updating prompt', status: 'error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // In a real application, you would delete the prompt from a database by ID
    // This is a temporary client-side implementation within a server-side route
    if (typeof window !== 'undefined') {
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
      const initialLength = savedPrompts.length;
      const filteredPrompts = savedPrompts.filter((p: any) => p.id !== id);

      if (filteredPrompts.length < initialLength) {
        localStorage.setItem('savedPrompts', JSON.stringify(filteredPrompts));
        return NextResponse.json({ message: 'Prompt deleted successfully', status: 'succeeded' });
      } else {
        return NextResponse.json({ message: 'Prompt not found', status: 'error' }, { status: 404 });
      }
    }

    // If window is not defined (server-side), return an error or handle accordingly
    return NextResponse.json({ message: 'Local storage not available', status: 'error' }, { status: 500 });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ message: 'Error deleting prompt', status: 'error' }, { status: 500 });
  }
}