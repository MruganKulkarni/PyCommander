'use client';

import { useState, useRef, useEffect, useCallback, useActionState } from 'react';
import { getCommandFromNaturalLanguage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Sparkles } from 'lucide-react';

type Output = {
  id: number;
  type: 'command' | 'response' | 'error' | 'ai_query' | 'ai_response';
  content: string;
  cwd?: string;
};

const HELP_MESSAGE = `
PyCommander v1.0.0
Available commands:
  ls          - List directory contents
  cd [dir]    - Change directory
  pwd         - Print working directory
  mkdir [dir] - Create a new directory
  rm [path]   - Remove a file or directory
  cat [file]  - Display file content
  echo [text] - Display a line of text
  date        - Display the current date and time
  help        - Show this help message
  clear       - Clear the terminal screen

AI commands:
  ai [query]  - e.g., "ai create a new folder called test"
`;

const WELCOME_MESSAGE = `Welcome to PyCommander! Type 'help' for a list of commands.`;

export function Terminal() {
  const [outputs, setOutputs] = useState<Output[]>([
    { id: 0, type: 'response', content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState('~');
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [aiState, getCommandAction] = useActionState(
    getCommandFromNaturalLanguage,
    { command: null, error: null }
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if(viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [outputs]);

  useEffect(() => {
    if (aiState.command && !aiState.error) {
      addOutput({ type: 'ai_response', content: `Executing: ${aiState.command}` });
      handleCommand(aiState.command, cwd);
    } else if (aiState.error) {
      addOutput({ type: 'error', content: `AI Error: ${aiState.error}` });
      setIsProcessing(false);
    }
  }, [aiState]);

  const addOutput = (newOutput: Omit<Output, 'id'>) => {
    setOutputs(prev => [...prev, { ...newOutput, id: prev.length }]);
  };

  const handleCommand = async (command: string, currentCwd: string) => {
    setIsProcessing(true);
    const [cmd, ...args] = command.trim().split(' ');

    if (cmd === 'clear') {
      setOutputs([]);
      setIsProcessing(false);
      return;
    }
    
    if (cmd === 'help') {
        addOutput({ type: 'response', content: HELP_MESSAGE });
        setIsProcessing(false);
        return;
    }

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim(), cwd: currentCwd }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      if (data.error) {
        addOutput({ type: 'error', content: data.error });
      } else {
        if(data.output !== undefined) addOutput({ type: 'response', content: data.output });
        if (data.newCwd) {
          setCwd(data.newCwd);
        }
      }
    } catch (e: any) {
      addOutput({ type: 'error', content: e.message });
      toast({
        variant: 'destructive',
        title: 'Command Execution Failed',
        description: 'Could not connect to the backend.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) return;

    addOutput({ type: 'command', content: trimmedInput, cwd });
    setHistory(prev => [trimmedInput, ...prev]);
    setHistoryIndex(-1);
    setInput('');

    if (trimmedInput.startsWith('ai ')) {
      const prompt = trimmedInput.substring(3);
      addOutput({ type: 'ai_query', content: `Query: ${prompt}` });
      getCommandAction(prompt);
    } else {
      handleCommand(trimmedInput, cwd);
    }
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

  const Prompt = ({ currentCwd }: { currentCwd: string }) => (
    <div className="flex">
      <span className="text-primary">user@pycommander</span>
      <span className="text-foreground">:</span>
      <span className="text-accent">{currentCwd}</span>
      <span className="text-foreground">$ &nbsp;</span>
    </div>
  );

  return (
    <div
      className="h-full w-full overflow-hidden rounded-lg border bg-background p-4"
      onClick={() => inputRef.current?.focus()}
    >
      <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
        <div className="pr-4">
          {outputs.map(output => (
            <div key={output.id} className="mb-2 w-full">
              {output.type === 'command' && output.cwd && (
                <div className="flex items-center">
                  <Prompt currentCwd={output.cwd} />
                  <span>{output.content}</span>
                </div>
              )}
              {output.type === 'response' && (
                <pre className="whitespace-pre-wrap text-foreground">
                  {output.content}
                </pre>
              )}
              {output.type === 'error' && (
                <pre className="whitespace-pre-wrap text-destructive">
                  {output.content}
                </pre>
              )}
              {output.type === 'ai_query' && (
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="italic">{output.content}</span>
                 </div>
              )}
              {output.type === 'ai_response' && (
                <pre className="whitespace-pre-wrap text-primary/80">
                  {output.content}
                </pre>
              )}
            </div>
          ))}

          {!isProcessing && (
            <form onSubmit={handleSubmit} className="flex items-center">
              <Prompt currentCwd={cwd} />
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="peer absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={isProcessing}
                />
                <div className="pointer-events-none flex items-center">
                  <span className="peer-focus:w-2 peer-focus:blinking-cursor h-5 w-0 bg-primary" />
                  <span className='invisible'>{input}</span>
                </div>
                 <div className="absolute inset-y-0 left-0 flex items-center text-foreground">
                    <span>{input}</span>
                </div>

              </div>
            </form>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
