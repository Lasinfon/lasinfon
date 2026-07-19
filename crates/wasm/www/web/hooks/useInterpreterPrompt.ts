import { useState, useEffect } from 'react';

export function useInterpreterPrompt() {
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    fetch('/api/prompt')
      .then(res => res.json())
      .then(data => {
        if (data.prompt) setPrompt(data.prompt);
      })
      .catch(err => console.error('Failed to load interpreter prompt:', err));
  }, []);

  return prompt;
}
