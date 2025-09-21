// A simple in-memory file system simulation
type File = {
  type: 'file';
  content: string;
};

type Directory = {
  type: 'directory';
  children: { [key: string]: File | Directory };
};

type FileSystemNode = File | Directory;

let fs: Directory = {
  type: 'directory',
  children: {
    '~': {
      type: 'directory',
      children: {
        Projects: {
          type: 'directory',
          children: {
            'pycommander.py': {
              type: 'file',
              content: '#!/usr/bin/env python\n\nprint("Hello from PyCommander!")',
            },
            'notes.txt': { type: 'file', content: 'Initial project notes.' },
          },
        },
        Documents: {
          type: 'directory',
          children: {
            'report.docx': { type: 'file', content: 'This is a dummy document.' },
          },
        },
        'README.md': {
          type: 'file',
          content:
            'Welcome to PyCommander!\n\nType `help` to see a list of available commands.',
        },
      },
    },
  },
};

const resolvePath = (cwd: string, path: string): string => {
  if (path.startsWith('~/')) {
    path = path.substring(1);
  } else if (path.startsWith('/')) {
    path = path.substring(1); // Treat root as `~` for simplicity
  }


  const newPathParts = path.split('/').filter(p => p);
  let finalParts = cwd === '~' ? [] : cwd.replace('~/', '').split('/');

  for (const part of newPathParts) {
    if (part === '.') continue;
    if (part === '..') {
      if (finalParts.length > 0) {
        finalParts.pop();
      }
    } else {
      finalParts.push(part);
    }
  }

  if (finalParts.length === 0) return '~';
  return `~/` + finalParts.join('/');
};


const getNode = (path: string): FileSystemNode | null => {
  if (path === '~') return fs.children['~'] as Directory;
  
  const parts = path.replace(/^~\//, '').split('/');
  let currentNode: FileSystemNode = fs.children['~'] as Directory;

  for (const part of parts) {
    if (currentNode.type === 'directory' && currentNode.children[part]) {
      currentNode = currentNode.children[part];
    } else {
      return null;
    }
  }
  return currentNode;
};

const getParentNode = (path: string): Directory | null => {
  if (path === '~' || !path.includes('/')) return fs.children['~'] as Directory;
  const parentPath = path.substring(0, path.lastIndexOf('/'));
  const parentNode = getNode(parentPath);
  if (parentNode && parentNode.type === 'directory') {
    return parentNode;
  }
  return null;
};

export const listDirectory = (path: string): string[] | null => {
  const node = getNode(path);
  if (node && node.type === 'directory') {
    return Object.keys(node.children).map(key => {
      return node.children[key].type === 'directory' ? `${key}/` : key;
    });
  }
  return null;
};

export const createDirectory = (cwd: string, dirName: string): boolean => {
  const parentNode = getNode(cwd);
  if (parentNode && parentNode.type === 'directory') {
    if (parentNode.children[dirName]) {
      return false; // Already exists
    }
    parentNode.children[dirName] = { type: 'directory', children: {} };
    return true;
  }
  return false;
};

export const readFile = (path: string): string | null => {
  const node = getNode(path);
  if (node && node.type === 'file') {
    return node.content;
  }
  return null;
};

export const changeDirectory = (cwd: string, newDir: string): string | null => {
  const newPath = resolvePath(cwd, newDir);
  const node = getNode(newPath);
  if (node && node.type === 'directory') {
    return newPath;
  }
  return null;
};

export const removePath = (path: string): boolean => {
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    const parentNode = getParentNode(path);
    if(parentNode && parentNode.children[fileName]){
        delete parentNode.children[fileName];
        return true;
    }
    return false;
};

export const getAutocompleteSuggestions = (cwd: string, partial: string): string[] => {
  const node = getNode(cwd);
  if (node && node.type === 'directory') {
    const children = Object.keys(node.children);
    return children.filter(child => child.startsWith(partial));
  }
  return [];
};
