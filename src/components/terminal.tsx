'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { getCommandFromNaturalLanguage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Sparkles } from 'lucide-react';
import { TerminalInput, Prompt } from './terminal-input';

type Output = {
  id: number;
  type: 'command' | 'response' | 'error' | 'ai_query' | 'ai_response';
  content: string;
  cwd?: string;
};

const WELCOME_MESSAGE = `Welcome to PyCommander! Type 'help' for a list of commands, or click the help icon in the top right.`;

export function Terminal() {
  const [outputs, setOutputs] = useState<Output[]>([
    { id: 0, type: 'response', content: WELCOME_MESSAGE },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [cwd, setCwd] = useState('~');
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const [aiState, getCommandAction, isAiProcessing] = useActionState(
    getCommandFromNaturalLanguage,
    { command: null, error: null }
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [outputs]);

  useEffect(() => {
    if (aiState.command && !aiState.error) {
      addOutput({
        type: 'ai_response',
        content: `Executing: ${aiState.command}`,
      });
      handleCommand(aiState.command, true);
    } else if (aiState.error) {
      addOutput({ type: 'error', content: `AI Error: ${aiState.error}` });
      setIsProcessing(false); 
    }
  }, [aiState]);

  useEffect(() => {
    setIsProcessing(isAiProcessing);
  }, [isAiProcessing]);


  const addOutput = (newOutput: Omit<Output, 'id'>) => {
    setOutputs((prev) => [...prev, { ...newOutput, id: prev.length }]);
  };

  const handleCommand = async (command: string, fromAi = false) => {
    if (!fromAi) {
      setIsProcessing(true);
    }

    const [cmd] = command.trim().split(' ');

    if (cmd === 'clear') {
      setOutputs([]);
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim(), cwd: cwd }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        addOutput({ type: 'error', content: data.error });
      } else {
        if (data.output !== undefined)
          addOutput({ type: 'response', content: data.output });
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

  const processSubmit = (formData: FormData) => {
    const command = formData.get('command') as string;
    if (!command) return;
    
    const trimmedInput = command.trim();
    if (!trimmedInput) return;

    addOutput({ type: 'command', content: trimmedInput, cwd });
    setHistory((prev) => [trimmedInput, ...prev]);

    if (trimmedInput.startsWith('ai ')) {
      const prompt = trimmedInput.substring(3);
      addOutput({ type: 'ai_query', content: `Query: ${prompt}` });
      getCommandAction(prompt);
    } else {
      handleCommand(trimmedInput);
    }
  };

  return (
    <div
      className="h-full w-full overflow-hidden rounded-lg border bg-background p-4 flex flex-col"
      onClick={() => formRef.current?.querySelector('input')?.focus()}
    >
      <ScrollArea className="flex-1 w-full" viewportRef={viewportRef}>
        <div className="pr-4">
          {outputs.map((output) => (
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
          {isAiProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="italic">AI is thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      <form ref={formRef} action={processSubmit}>
        <TerminalInput
          cwd={cwd}
          history={history}
          isProcessing={isProcessing}
        />
      </form>
    </div>
  );
}
