import type { FileNode } from './types';

export const findPath = (tree: FileNode[], nodeId: string): FileNode[] => {
    const path: FileNode[] = [];
    function find(nodes: FileNode[]): boolean {
        for (const node of nodes) {
            path.push(node);
            if (node.id === nodeId) return true;
            if (node.children && find(node.children)) return true;
            path.pop();
        }
        return false;
    }
    find(tree);
    return path;
};

export const findNode = (tree: FileNode[], nodeId: string): FileNode | null => {
    for (const node of tree) {
        if (node.id === nodeId) return node;
        if (node.children) {
            const found = findNode(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
};

export const updateNode = (tree: FileNode[], nodeId: string, updates: Partial<FileNode>): FileNode[] => {
    return tree.map(node => {
        if (node.id === nodeId) {
            return { ...node, ...updates };
        }
        if (node.children) {
            return { ...node, children: updateNode(node.children, nodeId, updates) };
        }
        return node;
    });
};

export const deleteNode = (tree: FileNode[], nodeId: string): FileNode[] => {
    return tree.filter(node => node.id !== nodeId).map(node => {
        if (node.children) {
            return { ...node, children: deleteNode(node.children, nodeId) };
        }
        return node;
    });
};

export const addNode = (tree: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] => {
    if (!parentId) {
        return [...tree, newNode];
    }
    return tree.map(node => {
        if (node.id === parentId) {
            return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
            return { ...node, children: addNode(node.children, parentId, newNode) };
        }
        return node;
    });
};
