import { NextResponse } from 'next/server';
import * as FS from '@/lib/file-system';

const getHelp = (): string => {
  return `PyCommander v1.0.0
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
  ai [query]  - e.g., "ai create a new folder called test"`;
};


export async function POST(req: Request) {
  try {
    const { command, cwd } = await req.json();
    const [cmd, ...args] = command.split(' ').filter(Boolean);

    if (!cmd) {
      return NextResponse.json({ output: '' });
    }

    switch (cmd.toLowerCase()) {
      case 'ls': {
        const path = args[0] ? FS.changeDirectory(cwd, args[0]) : cwd;
        if (!path) {
            return NextResponse.json({ error: `ls: cannot access '${args[0]}': No such file or directory` });
        }
        const contents = FS.listDirectory(path);
        return NextResponse.json({ output: contents ? contents.join('\n') : `ls: cannot access '${path}': No such file or directory` });
      }

      case 'pwd':
        return NextResponse.json({ output: cwd });

      case 'cd': {
        if (!args[0]) {
          return NextResponse.json({ output: '' });
        }
        const newCwd = FS.changeDirectory(cwd, args[0]);
        if (newCwd) {
          return NextResponse.json({ newCwd });
        }
        return NextResponse.json({ error: `cd: no such file or directory: ${args[0]}` });
      }

      case 'mkdir': {
        if (!args[0]) {
          return NextResponse.json({ error: 'mkdir: missing operand' });
        }
        const success = FS.createDirectory(cwd, args[0]);
        return success
          ? NextResponse.json({ output: '' })
          : NextResponse.json({ error: `mkdir: cannot create directory '${args[0]}': File exists` });
      }

      case 'cat': {
        if (!args[0]) {
            return NextResponse.json({ error: 'cat: missing operand' });
        }
        const path = FS.changeDirectory(cwd, args[0]);
        if (!path) {
          return NextResponse.json({ error: `cat: ${args[0]}: No such file or directory` });
        }
        const content = FS.readFile(path);
        if (content === null) {
            return NextResponse.json({ error: `cat: ${args[0]}: Is a directory` });
        }
        return NextResponse.json({ output: content });
      }

      case 'echo':
        return NextResponse.json({ output: args.join(' ') });

      case 'date':
        return NextResponse.json({ output: new Date().toString() });
      
      case 'help':
        return NextResponse.json({ output: getHelp() });

      case 'rm': {
        if (!args[0]) {
            return NextResponse.json({ error: 'rm: missing operand' });
        }
        const path = FS.changeDirectory(cwd, args[0]);
        if (!path) {
            return NextResponse.json({ error: `rm: cannot remove '${args[0]}': No such file or directory` });
        }
        const success = FS.removePath(path);
        return success
          ? NextResponse.json({ output: '' })
          : NextResponse.json({ error: `rm: cannot remove '${args[0]}': No such file or directory` });
      }

      default:
        return NextResponse.json({ error: `${command}: command not found` });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
