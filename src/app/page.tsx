import { HelpCircle } from 'lucide-react';
import { Terminal } from '@/components/terminal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6">
        <h1 className="text-xl font-semibold text-primary">PyCommander</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-6 w-6 text-primary" />
              <span className="sr-only">Help</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to use PyCommander</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm dark:prose-invert">
              <p>
                Welcome to PyCommander, an AI-powered terminal. Here are some
                tips to get you started:
              </p>
              <h3 className="text-primary">Standard Commands</h3>
              <p>
                You can use standard Linux-like commands to navigate and
                interact with the file system.
              </p>
              <ul className="list-disc pl-5">
                <li>
                  <code>ls</code> - List directory contents
                </li>
                <li>
                  <code>cd [directory]</code> - Change directory
                </li>
                <li>
                  <code>pwd</code> - Print working directory
                </li>
                <li>
                  <code>cat [file]</code> - Display file content
                </li>
                <li>
                  <code>mkdir [directory]</code> - Create a directory
                </li>
                <li>
                  <code>rm [path]</code> - Remove a file or directory
                </li>
                <li>
                  <code>echo [text]</code> - Display a line of text
                </li>
                <li>
                  <code>clear</code> - Clear the terminal screen
                </li>
              </ul>
              <h3 className="text-primary">AI Commands</h3>
              <p>
                Prefix your command with <code>ai</code> to let the AI figure
                out the correct terminal command for you.
              </p>
              <p>
                <strong>Examples:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>
                  <code>ai create a new folder called my-project</code>
                </li>
                <li>
                  <code>ai show me the contents of README.md</code>
                </li>
                <li>
                  <code>ai navigate into the Projects directory</code>
                </li>
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <main className="flex-1 overflow-hidden p-4">
        <Terminal />
      </main>
    </div>
  );
}
