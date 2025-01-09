"use client";
import React, { useEffect, useState } from 'react';
import { SavedPrompt } from '@prisma/client';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';
import { Trash, Search, Book } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SavedPromptsPage() {
  const { user, isLoading } = useUser();
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchSavedPrompts() {
      if (!user?.id) return;
      const data = await fetch(`/api/saved-prompts`, {
        method: 'GET',
      });
      if (!data) return;
      const prompts = await data.json();
      setSavedPrompts(prompts.prompts);
    }

    fetchSavedPrompts();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/saved-prompts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSavedPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
      toast.success('Prompt deleted successfully');
    } catch (error) {
      toast.error('Failed to delete prompt');
      console.error(error);
    }
  };

  const filteredPrompts = savedPrompts.filter((prompt) =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Saved Prompts</h1>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search saved prompts..."
              className="w-full pl-10 bg-gray-900 border-gray-800 text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : filteredPrompts.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center text-gray-400">
              <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved prompts found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrompts.map((prompt) => (
              <Card 
                key={prompt.id} 
                className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-md font-medium">{prompt.title}</CardTitle>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Delete prompt"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 mt-1">
                    {prompt.content?.slice(0, 100)}...
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}