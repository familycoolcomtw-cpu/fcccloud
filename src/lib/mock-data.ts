import type { FileNode } from './types';

export const mockFiles: FileNode[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    createdAt: '2023-10-01T10:00:00Z',
    tags: [],
    children: [
      {
        id: '1-1',
        name: 'Project Proposal.pdf',
        type: 'pdf',
        size: 1204 * 1024,
        createdAt: '2023-10-01T10:05:00Z',
        tags: ['project', 'work', 'proposal'],
      },
      {
        id: '1-2',
        name: 'Meeting Notes.docx',
        type: 'document',
        size: 50 * 1024,
        createdAt: '2023-10-02T14:30:00Z',
        tags: ['meeting', 'work'],
      },
    ],
  },
  {
    id: '2',
    name: 'Photos',
    type: 'folder',
    createdAt: '2023-10-01T11:00:00Z',
    tags: [],
    children: [
      {
        id: '2-1',
        name: 'vacation-spain.jpg',
        type: 'image',
        size: 4500 * 1024,
        createdAt: '2023-09-15T18:20:00Z',
        tags: ['vacation', 'spain', 'travel', 'personal'],
        aiHint: "beach sunset"
      },
      {
        id: '2-2',
        name: 'family-gathering.png',
        type: 'image',
        size: 3200 * 1024,
        createdAt: '2023-08-20T16:45:00Z',
        tags: ['family', 'personal', 'event'],
        aiHint: "family dinner"
      },
    ],
  },
  {
    id: '3',
    name: 'System Design.pdf',
    type: 'pdf',
    size: 8300 * 1024,
    createdAt: '2023-10-03T09:00:00Z',
    tags: ['work', 'architecture', 'system design'],
  },
  {
    id: '4',
    name: 'logo.svg',
    type: 'image',
    size: 15 * 1024,
    createdAt: '2023-09-28T12:00:00Z',
    tags: ['design', 'logo', 'branding'],
    aiHint: "abstract logo"
  },
  {
    id: '5',
    name: 'Product-demo.mp4',
    type: 'video',
    size: 150 * 1024 * 1024,
    createdAt: '2023-10-04T17:00:00Z',
    tags: ['demo', 'product', 'video'],
  },
];
