export const mockUser = {
  id: 'user_1',
  email: 'dev@example.com',
  name: 'Dev User',
  image: 'https://avatar.vercel.sh/dev@example.com',
  isPro: false,
  createdAt: new Date('2026-04-01'),
}

export const mockItemTypes = [
  { id: 'type_snippet', name: 'Snippet', icon: '</>', color: '#f0ab00', isSystem: true },
  { id: 'type_prompt', name: 'Prompt', icon: '🤖', color: '#bf00ff', isSystem: true },
  { id: 'type_note', name: 'Note', icon: '📝', color: '#00b4d8', isSystem: true },
  { id: 'type_command', name: 'Command', icon: '$_', color: '#2ecc71', isSystem: true },
  { id: 'type_file', name: 'File', icon: '📎', color: '#e74c3c', isSystem: true },
  { id: 'type_image', name: 'Image', icon: '🖼️', color: '#9b59b6', isSystem: true },
  { id: 'type_url', name: 'URL', icon: '🔗', color: '#3498db', isSystem: true },
]

export const mockCollections = [
  {
    id: 'col_1',
    name: 'React Patterns',
    description: 'Reusable React hooks and component patterns',
    icon: '⚛️',
    color: '#61dafb',
    isFavorite: true,
    userId: 'user_1',
    createdAt: new Date('2026-04-05'),
  },
  {
    id: 'col_2',
    name: 'AI Context Files',
    description: 'Prompts and context files for AI workflows',
    icon: '🤖',
    color: '#8b5cf6',
    isFavorite: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-10'),
  },
  {
    id: 'col_3',
    name: 'Python Snippets',
    description: 'Useful Python code snippets and cheatsheets',
    icon: '🐍',
    color: '#3776ab',
    isFavorite: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-15'),
  },
]

export const mockItems = [
  {
    id: 'item_1',
    title: 'useLocalStorage hook',
    description: 'Custom hook for persisting state to localStorage',
    contentType: 'text',
    content: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}`,
    language: 'typescript',
    typeId: 'type_snippet',
    collectionId: 'col_1',
    isFavorite: true,
    isPinned: true,
    userId: 'user_1',
    createdAt: new Date('2026-04-06'),
  },
  {
    id: 'item_2',
    title: 'Error boundary template',
    description: 'Reusable error boundary component for React 19',
    contentType: 'text',
    content: `import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <div>Something went wrong: {this.state.error.message}</div>
    }
    return this.props.children
  }
}`,
    language: 'tsx',
    typeId: 'type_snippet',
    collectionId: 'col_1',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-07'),
  },
  {
    id: 'item_3',
    title: 'Component architecture',
    description: 'Notes on React component structure best practices',
    contentType: 'text',
    content: '# Component Architecture\n\n- Keep components small and focused\n- Use composition over inheritance\n- Co-locate related files (styles, tests, types)',
    typeId: 'type_note',
    collectionId: 'col_1',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-08'),
  },
  {
    id: 'item_4',
    title: 'Project context.md',
    description: 'Project context file for AI code reviews',
    contentType: 'file',
    fileName: 'project-context.md',
    fileUrl: '/mock/project-context.md',
    fileMimeType: 'text/markdown',
    typeId: 'type_file',
    collectionId: 'col_2',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-11'),
  },
  {
    id: 'item_5',
    title: 'Code reviewer prompt',
    description: 'Prompt for reviewing React code with TypeScript',
    contentType: 'text',
    content: 'Review the following React component for TypeScript errors, potential bugs, and best practices. Provide actionable feedback.',
    typeId: 'type_prompt',
    collectionId: 'col_2',
    isFavorite: true,
    isPinned: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-12'),
  },
  {
    id: 'item_6',
    title: 'Summarizer system msg',
    description: 'System message for text summarization tasks',
    contentType: 'text',
    content: 'You are a helpful assistant that summarizes text into 1-2 concise sentences. Focus on key points and avoid fluff.',
    typeId: 'type_prompt',
    collectionId: 'col_2',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-13'),
  },
  {
    id: 'item_7',
    title: 'Pandas cheatsheet',
    description: 'Quick reference for common Pandas operations',
    contentType: 'text',
    content: '# Pandas Cheatsheet\n\n## Read CSV\nimport pandas as pd\ndf = pd.read_csv("data.csv")\n\n## Filter rows\ndf[df["column"] > 10]',
    typeId: 'type_note',
    collectionId: 'col_3',
    isFavorite: false,
    isPinned: false,
    userId: 'user_1',
    createdAt: new Date('2026-04-16'),
  },
  {
    id: 'item_8',
    title: 'FastAPI auth boilerplate',
    description: 'Basic authentication setup for FastAPI',
    contentType: 'text',
    content: `from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    return {"token": token}`,
    language: 'python',
    typeId: 'type_snippet',
    collectionId: 'col_3',
    isFavorite: true,
    isPinned: true,
    userId: 'user_1',
    createdAt: new Date('2026-04-17'),
  },
]
