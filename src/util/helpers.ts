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