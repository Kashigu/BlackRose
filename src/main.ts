import fs from 'fs';

import { tokenize } from './frontEnd/lexer'; 
import { parse } from './frontEnd/parser'; 
import { analyze } from './runTime/semantic';
import { interpret } from './runTime/interpreter';

// Function to read the .blk file
function readBLKFile(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error(`Error reading file: ${filePath}`);
        return null;
    }
}

// Function to run the .blk file
export function runBLKFile(filePath: string): void {
    const code = readBLKFile(filePath);
    if (code) {
        try {
            const tokens = tokenize(code);
            const ast = parse(tokens);
            analyze(ast);
            interpret(ast);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unknown error occurred");
            }
        }
    }
}
