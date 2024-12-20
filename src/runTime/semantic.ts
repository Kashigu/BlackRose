import { ASTNode, ASTNodeType } from "../frontEnd/ast";


const ValidBinaryOperators = ["+", "-", "*", "/", "+=","-=", "*=", "/="];
const ValidComparisonOperators = ["==", "!=", "<", ">", "<=", ">="];
const ValidUnitaryOperators = ["++", "--"];

export function analyze(node: ASTNode): void {
    switch (node.type) {
        case ASTNodeType.PROGRAM:
            for (const child of node.children) {
                analyze(child); // Analyze each child
            }
            break;

        case ASTNodeType.ASSIGNMENT:
            if (!node.name) {
                throw new Error("Assignment must have a variable name.");
            }
            analyze(node.value); // Validate the assigned value
            break;

        case ASTNodeType.BINARYOPERATOR:
            analyze(node.left); // Validate left operand
            analyze(node.right); // Validate right operand
            if (!ValidBinaryOperators.includes(node.value)) {
                throw new Error(`Unknown operator ${node.value}`);
            }
            break;

        case ASTNodeType.NUMBER:
        case ASTNodeType.STRING:
        case ASTNodeType.LITERAL:
            // No further validation required for literals
            break;

        case ASTNodeType.COMMENT:
            // No validation required for comments
            break;

        case ASTNodeType.WRITE:
            const child = node.children[0];
            analyze(child); // Validate the child 
            if (child.type !== ASTNodeType.STRING && child.type !== ASTNodeType.LITERAL) {
                throw new Error("WRITE node must have a STRING child.");
            }
            break;

        case ASTNodeType.FOR:
            // Validate the loop variable
            if (!node.initialization) {
                throw new Error("FOR loop must have a variable.");
            }
            analyze(node.initialization);

            // Validate the loop condition
            if (!node.condition) {
                throw new Error("FOR loop must have a condition.");
            }
            analyze(node.condition);

            // Validate the loop increment
            if (!node.increment) {
                throw new Error("FOR loop must have an increment.");
            }
            analyze(node.increment);

            // Validate the loop body
            if (!node.body) {
                throw new Error("FOR loop must have a body.");
            }
            analyze(node.body);
            
            break;

        case ASTNodeType.COMPARISONOPERATOR:
            if (!ValidComparisonOperators.includes(node.value)) {
                throw new Error(`Unknown comparison operator ${node.value}`);
            }
            analyze(node.left); // Validate left operand
            analyze(node.right); // Validate right operand

            break;
        case ASTNodeType.UNITARYOPERATOR:
            // Validate the unitary operator
            if (!ValidUnitaryOperators.includes(node.value)) {
                throw new Error(`Unknown unitary operator ${node.value}`);
            }
           
            analyze(node.left); // Validate the operand

            break;

        case ASTNodeType.BLOCK:
            // Validate each child of the block
            if (node.children) {
                for (const child of node.children) {
                    analyze(child);
                }
            }
            break;

        default:
            throw new Error(`Unknown node type ${node.type}`);
    }
}