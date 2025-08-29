import React, { useEffect, useState } from 'react';

interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}
interface PromptLibraryProps {
  onUsePrompt: (promptText: string) => void;
}


const PromptLibrary: React.FC = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromptData, setNewPromptData] = useState({
    title: '',
    prompt: '',
    category: '',
    tags: '',
  });
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const { onUsePrompt } = props; // Destructure onUsePrompt from props

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        throw new Error(`Error fetching prompts: ${response.statusText}`);
      }
      const data = await response.json();
      setPrompts(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPromptData({ ...newPromptData, [name]: value });
  };

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const promptToSave = {
      id: Date.now().toString(), // Simple unique ID for now
      title: newPromptData.title,
      prompt: newPromptData.prompt,
      category: newPromptData.category || undefined,
      tags: newPromptData.tags ? newPromptData.tags.split(',').map(tag => tag.trim()) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const method = editingPromptId ? 'PUT' : 'POST';
    const url = editingPromptId ? `/api/prompts/${editingPromptId}` : '/api/prompts';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPromptId ? { ...promptToSave, id: editingPromptId, updatedAt: Date.now() } : promptToSave),
      });

      if (!response.ok) {
        throw new Error(`Error saving prompt: ${response.statusText}`);
      }

      // Assuming the API returns the saved prompt or a success message
      const result = await response.json();
      console.log('Prompt saved:', result);

      // Clear the form
      setNewPromptData({ title: '', prompt: '', category: '', tags: '' });
      setEditingPromptId(null);
      setShowAddForm(false);

      // Refresh the prompt list
      fetchPrompts();

    } catch (error: any) {
      setError(error.message);
      setLoading(false); // Stop loading on error
    }
  };

  const handleEditClick = (prompt: SavedPrompt) => {
    setEditingPromptId(prompt.id);
    setNewPromptData({
      title: prompt.title,
      prompt: prompt.prompt,
      category: prompt.category || '',
      tags: prompt.tags ? prompt.tags.join(', ') : '',
    });
    setShowAddForm(true); // Show the form when editing
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error deleting prompt: ${response.statusText}`);
        }

        // Refresh the prompt list
        fetchPrompts();
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    }
  };

  const handleUsePromptClick = (promptText: string) => {
    onUsePrompt(promptText);
  };
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', width: '300px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Prompt Library</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel Add' : 'Add New Prompt'}
 {editingPromptId && ' / Cancel Edit'}
        </button>
      </div>

      {showAddForm && ( // Keep the form visible for both add and edit
        <form onSubmit={handleSavePrompt} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            name="title"
            placeholder="Prompt Title"
            value={newPromptData.title}
            onChange={handleInputChange}
            required
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <textarea
            name="prompt"
            placeholder="Prompt Text"
            value={newPromptData.prompt}
            onChange={handleInputChange}
            required
            rows={5}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="text"
            name="category"
            placeholder="Category (Optional)"
            value={newPromptData.category}
            onChange={handleInputChange}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma-separated, Optional)"
            value={newPromptData.tags}
            onChange={handleInputChange}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '8px', backgroundColor: '#77B5FE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Prompt</button>
        </form>
      )}

      {loading && <div>Loading prompts...</div>}
      {error && <div>Error loading prompts: {error}</div>}

      {!loading && !error && prompts.length === 0 ? (
        <p>No prompts saved yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {!loading && !error && prompts.map((prompt) => (
            <li key={prompt.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{prompt.title}</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#555' }}>{prompt.prompt}</p>
              <button onClick={() => handleEditClick(prompt)} style={{ marginRight: '10px' }}>
                Edit
              </button>
              <button onClick={() => handleDeleteClick(prompt.id)} style={{ color: 'red' }}>
                Delete
              </button>
              <button onClick={() => handleUsePromptClick(prompt.prompt)} style={{ marginLeft: '10px', backgroundColor: '#CCCCFF', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px' }}>
                Use Prompt
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PromptLibrary;