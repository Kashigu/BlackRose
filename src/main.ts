const fs = require('fs');
const path = require('path');


import { tokenize } from './frontEnd/lexer'; 
import { parse } from './frontEnd/parser'; 
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
        // Tokenize the code using your lexer
        const tokens = tokenize(code); 
        console.log({ tokens });

        // Parse the tokens into an AST using your parser
        const ast = parse(tokens); 
        console.log('AST:', JSON.stringify(ast, null, 2)); // If you want it pretty-printed

        // Interpret and execute the AST
        interpret(ast); 
    }
}


const filePath = path.resolve(__dirname, '..', 'tests', 'test.blk'); // Navigate up one level from src and go into tests

// Run the code from a .blk file
runBLKFile(filePath); 