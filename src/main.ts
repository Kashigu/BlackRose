const fs = require('fs');
const path = require('path');

// Example Lexer, Parser, and Interpreter
// Assuming you have appropriate files for these
import { tokenize } from './frontEnd/lexer'; // Make sure the file path is correct
import { parse } from './frontEnd/parser'; // Make sure the file path is correct
import { interpret } from './runTime/interpreter'; // Make sure the file path is correct

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
        const tokens = tokenize(code); // You must have a lexer function that tokenizes the code

        // Parse the tokens into an AST using your parser
        const ast = parse(tokens); // Your parser function should return an AST

        // Interpret and execute the AST
        interpret(ast); // Your interpreter function should process the AST and execute it
    }
}

// Adjust the path to navigate from src to tests/test.blk
const filePath = path.resolve(__dirname, '..', 'tests', 'test.blk'); // Navigate up one level from src and go into tests

// Run the code from a .blk file
runBLKFile(filePath); // Ensure test.blk exists in your project at the correct location