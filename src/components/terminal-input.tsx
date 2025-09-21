
'use client';
import { useRef, useState, useEffect } from 'react';

export const Prompt = ({ currentCwd }: { currentCwd: string }) => (
    <div className="flex">
      <span className="text-primary">user@pycommander</span>
      <span className="text-foreground">:</span>
      <span className="text-accent">{currentCwd}</span>
      <span className="text-foreground">$ &nbsp;</span>
    </div>
);
  

type TerminalInputProps = {
    cwd: string;
    onSubmit: (command: string) => void;
    history: string[];
    isProcessing: boolean;
};

export function TerminalInput({ cwd, onSubmit, history, isProcessing }: TerminalInputProps) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) return;
    
    onSubmit(trimmedInput);
    
    setHistoryIndex(-1);
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(history.length - 1, historyIndex + 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        // Autocomplete logic can be added here
    }
  };

  return (
    <div>
     {!isProcessing && (
        <form onSubmit={handleSubmit} className="flex items-center mt-2">
            <Prompt currentCwd={cwd} />
            <div className="relative flex-1">
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-foreground outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={isProcessing}
            />
            </div>
        </form>
    )}
    </div>
  );
}
