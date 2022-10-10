import { DocumentSelector } from "vscode";

export const compatibleFilesSelector: DocumentSelector = [
    { language: 'typescript', scheme: 'file' },
    { language: 'javascript', scheme: 'file' },
    { language: 'lua', scheme: 'file' },
    { language: 'c', scheme: 'file' },
    { language: 'csharp', scheme: 'file' },
    { language: 'typescript', scheme: 'untitled' },
    { language: 'javascript', scheme: 'untitled' },
    { language: 'lua', scheme: 'untitled' },
    { language: 'c', scheme: 'untitled' },
    { language: 'csharp', scheme: 'untitled' }
];