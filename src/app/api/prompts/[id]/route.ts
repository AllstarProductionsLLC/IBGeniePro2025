import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // This is a temporary client-side implementation.
    if (typeof window !== 'undefined') {
      const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
      const prompt = savedPrompts.find((p: any) => p.id === id); 

      if (prompt) {
        return NextResponse.json(prompt);
      } else {
        return NextResponse.json({ message: 'Prompt not found', status: 'error' }, { status: 404 });
      }
    }

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

    // This is a temporary client-side implementation.
    if (typeof window !== 'undefined') {
      let savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
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

    // This is a temporary client-side implementation.
    if (typeof window !== 'undefined') {
      let savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
      const initialLength = savedPrompts.length;
      const filteredPrompts = savedPrompts.filter((p: any) => p.id !== id);

      if (filteredPrompts.length < initialLength) {
        localStorage.setItem('savedPrompts', JSON.stringify(filteredPrompts));
        return NextResponse.json({ message: 'Prompt deleted successfully', status: 'succeeded' });
      } else {
        return NextResponse.json({ message: 'Prompt not found', status: 'error' }, { status: 404 });
      }
    }

    return NextResponse.json({ message: 'Local storage not available', status: 'error' }, { status: 500 });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ message: 'Error deleting prompt', status: 'error' }, { status: 500 });
  }
}
