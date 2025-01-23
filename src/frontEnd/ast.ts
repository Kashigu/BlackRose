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
        BLOCK = 'Block', // Added for block statements
        IF = 'If',
        ELSE = 'Else',
        IFELSE = 'IfElse',
        BREAK = 'Break',
        CONTINUE = 'Continue',
        WHILE = 'While',
        TRUE = 'True',
        FALSE = 'False',
        LOGICALOPERATOR = 'LogicalOperator',
        SWITCH = 'Switch',
        CASE = 'Case',
}
  
interface ASTValueNode<T extends ASTNodeType, K> {
    type: T,
    value: K
}

interface AST_X_Node<X extends ASTNodeType> {
    type: X;
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


interface ASTBinaryOperatorNode {
    type: ASTNodeType.BINARYOPERATOR,
    left: ASTNode,
    right: ASTNode,
    value: string
}

interface ASTComparisonOperatorNode {
    type: ASTNodeType.COMPARISONOPERATOR,
    left: ASTNode,
    right: ASTNode | null,
    value: string
}

interface ASTLogicalOperatorNode {
    type: ASTNodeType.LOGICALOPERATOR,
    left: ASTNode,
    right: ASTNode,
    value: string
}

interface ASTSwitchNode {
    type: ASTNodeType.SWITCH,
    condition: ASTNode,
    cases: ASTCaseNode[]
}

export interface ASTCaseNode {
    type: ASTNodeType.CASE,
    condition: ASTNode,
    body: ASTBlockNode
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

interface ASTWhileNode {
    type: ASTNodeType.WHILE;
    condition: ASTNode;
    body: ASTBlockNode;
}

interface ASTIfNode {
    type: ASTNodeType.IF;
    condition: ASTNode;
    body: ASTBlockNode;
}

interface ASTIfElseNode {
    type: ASTNodeType.IFELSE;
    condition: ASTNode;
    body: ASTBlockNode;
}

interface ASTElseNode{
    type: ASTNodeType.ELSE;
    body: ASTBlockNode;
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
            ASTValueNode<ASTNodeType.COMMENT, string> |
            ASTValueNode<ASTNodeType.TRUE, string> |
            ASTValueNode<ASTNodeType.FALSE, string> |
            AST_X_Node<ASTNodeType.BREAK> |
            AST_X_Node<ASTNodeType.CONTINUE> |
            ASTLogicalOperatorNode |
            ASTWhileNode |
            ASTSwitchNode |
            ASTComparisonOperatorNode |
            ASTUnitaryOperatorNode |
            ASTIfNode |
            ASTElseNode |
            ASTIfElseNode |
            ASTForNode |
            ASTBinaryOperatorNode |
            ASTProgramNode |
            ASTAssignmentNode |
            ASTBlockNode |
            ASTCaseNode |
            ASTWriteNode;
  