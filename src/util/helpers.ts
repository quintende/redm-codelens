export const invokers = {
    lua: /Citizen\.InvokeNative\((.*?)[,)]/g,
    c: /::(_0x.*?)\(/g,
    csharp: /Function\.Call<?(.*?)>?\((?:\(Hash\))?(.*?)[,)]/g,
    javascript: /Citizen\.invokeNative\((.*?)[,)]/g,
    typescript: /Citizen\.invokeNative<?(.*?)>?\((.*?)[,)]/g
};

export const selectors = [
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

export const snakeToPascalCase = (string: string) => string
    .toLowerCase()
    .replace(
        /_(\w)/g,
        ($, $1) => $1.toUpperCase()
    );

export const kebabCase = (string: string) => string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export const escapeHash = (hash: string) => hash.replace(/[_'"`]+/g, '').trim();

export const generateIdentifier = (document: any, match: any, hash: string) => {
    const position = document.positionAt(match.index as number);
    const line = document.lineAt(position.line);

    let seed: string = line.text;
    // @ts-ignore
    seed = seed.replaceAll('()', '__');
    seed = seed.substring(position.character);
    seed = seed.substring(0, seed.indexOf(')'));

    const identifier = kebabCase(`L:${line.lineNumber}|H:${hash}|F:${seed}`);
    
    return identifier;
}