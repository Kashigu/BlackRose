export enum ASTNodeType {
        PROGRAM = 'Program',
        LITERAL = 'Literal',
        STRING = 'String',
        ASSIGNMENT = 'Assignment',
        WRITE = 'Write',
        NUMBER = 'Number',
        BINARYOPERATOR = 'BinaryOperator',
        COMMENT = 'Comment',
        NULL = 'Null',
        FOR = 'For',
        COMPARISONOPERATOR = 'Comparison',
        UNITARYOPERATOR = 'UnitaryOperators',
        BLOCK = 'Block' // Added for block statements
}
  
interface ASTValueNode<T extends ASTNodeType, K> {
    type: T,
    value: K
}
  
interface ASTProgramNode {
    type: ASTNodeType.PROGRAM,
    children: ASTNode[]
}
  
interface ASTAssignmentNode {
    type: ASTNodeType.ASSIGNMENT,
    name: string,
    value: ASTNode
}
  
interface ASTWriteNode {
    type: ASTNodeType.WRITE,
    children: ASTNode[]
}

interface ASTCommentNode {
    type: ASTNodeType.COMMENT,
    value: string
}

interface ASTBinaryOperatorNode {
    type: ASTNodeType.BINARYOPERATOR,
    left: ASTNode,
    right: ASTNode,
    value: string
}

interface ASTComparisonOperatorNode {
    type: ASTNodeType.COMPARISONOPERATOR,
    left: ASTNode,
    right: ASTNode,
    value: string
}

interface ASTUnitaryOperatorNode {
    type: ASTNodeType.UNITARYOPERATOR,
    left: ASTNode,
    value: string
}


interface ASTForNode {
    type: ASTNodeType.FOR;
    initialization: ASTNode  // e.g., variable declaration or assignment
    condition: ASTNode // e.g., a binary condition
    increment: ASTNode // e.g., an increment or update operation
    body: ASTBlockNode; // The loop body
}

export interface ASTBlockNode {
    type: ASTNodeType.BLOCK,
    children?: ASTNode[] 
}
  
export type ASTNode =
            ASTValueNode<ASTNodeType.STRING, string> |
            ASTValueNode<ASTNodeType.LITERAL, string> |
            ASTValueNode<ASTNodeType.NUMBER, string> |
            ASTValueNode<ASTNodeType.NULL, string> |
            ASTComparisonOperatorNode |
            ASTUnitaryOperatorNode |
            ASTForNode |
            ASTBinaryOperatorNode |
            ASTProgramNode |
            ASTCommentNode |
            ASTAssignmentNode |
            ASTBlockNode |
            ASTWriteNode;
  