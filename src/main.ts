import fs from 'fs';
import path from 'path';

import { tokenize } from './frontEnd/lexer'; 
import { parse } from './frontEnd/parser'; 
import { analyze } from './runTime/semantic';
import { interpret } from './runTime/interpreter';

// Function to read the .blk file
function readBLKFile(filePath: string): string | null {
    try {
        const code = fs.readFileSync(filePath, 'utf-8');
        return code;
    } catch (error) {
        console.error(`Error reading file: ${filePath}`, error);
        return null;
    }
}

// Function to run the DSL code from a .blk file
function runBLKFile(filePath: string): void {
    const code = readBLKFile(filePath);
    if (code) {
        try {
            // Tokenize the code using your lexer
            const tokens = tokenize(code); 

            // Parse the tokens into an AST using your parser
            const ast = parse(tokens); 

            analyze(ast);

            // Interpret and execute the AST
            interpret(ast); 
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message); // Only log the error message, not the stack trace
            } else {
                console.error("An unknown error occurred");
            }
        }
    }
}

// Accept folder and file name from command-line arguments
const args = process.argv.slice(2); // Capture command-line arguments

if (args.length !== 2) {
    console.error("Please provide both the folder name and the .blk file name.");
    process.exit(1);
}

// Get the folder and file name from the arguments
const folderName = args[0];
const fileName = args[1];

// Ensure the file name ends with .blk
if (!fileName.endsWith('.blk')) {
    console.error("Please provide a .blk file.");
    process.exit(1);
}

// Resolve the file path dynamically
const filePath = path.resolve(__dirname,'..',folderName, fileName);

// Run the .blk file
runBLKFile(filePath);
