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
        DEFAULT = 'Default',
        DO = 'Do'
}
  
interface ASTValueNode<T extends ASTNodeType, K> {
    type: T,
    value: K
}

interface AST_X_Node<X extends ASTNodeType> {
    type: X;
}

interface AST_X_Children<X extends ASTNodeType> {
    type: X,
    children: ASTNode[]
}

interface AST_X_BODY_NODE<X extends ASTNodeType> {
    type: X,
    body: ASTBlockNode
}

interface AST_X_OPERATOR_NODE<X extends ASTNodeType> {
    type: X,
    left: ASTNode,
    right: ASTNode,
    value: string
}
  
interface AST_X_CONDITION_NODE<X extends ASTNodeType> {
    type: X,
    condition: ASTNode
    body: ASTBlockNode
}

// This one is special because I dont wanna change the whole code (I will do it later I swear)
export interface ASTCaseNode {
    type: ASTNodeType.CASE,
    condition: ASTNode,
    body: ASTBlockNode
}
export interface ASTDefaultNode{
    type: ASTNodeType.DEFAULT,
    body: ASTBlockNode
}
  
interface ASTAssignmentNode {
    type: ASTNodeType.ASSIGNMENT,
    name: string,
    value: ASTNode
}

interface ASTComparisonOperatorNode {
    type: ASTNodeType.COMPARISONOPERATOR,
    left: ASTNode,
    right: ASTNode | null,
    value: string
}


interface ASTSwitchNode {
    type: ASTNodeType.SWITCH,
    condition: ASTNode,
    cases: AST_X_CONDITION_NODE<ASTNodeType.CASE>[],
    default: AST_X_BODY_NODE<ASTNodeType.DEFAULT> | null
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
            ASTValueNode<ASTNodeType.COMMENT, string> |
            ASTValueNode<ASTNodeType.TRUE, string> |
            ASTValueNode<ASTNodeType.FALSE, string> |
            AST_X_Node<ASTNodeType.BREAK> |
            AST_X_Node<ASTNodeType.CONTINUE> |
            AST_X_Children<ASTNodeType.PROGRAM> |
            AST_X_Children<ASTNodeType.WRITE> |
            AST_X_CONDITION_NODE<ASTNodeType.CASE> |
            AST_X_CONDITION_NODE<ASTNodeType.DO> |
            AST_X_CONDITION_NODE<ASTNodeType.WHILE> |
            AST_X_CONDITION_NODE<ASTNodeType.IF> |
            AST_X_CONDITION_NODE<ASTNodeType.IFELSE> |
            AST_X_OPERATOR_NODE<ASTNodeType.LOGICALOPERATOR> |
            AST_X_OPERATOR_NODE<ASTNodeType.BINARYOPERATOR> |
            AST_X_BODY_NODE<ASTNodeType.ELSE> |
            AST_X_BODY_NODE<ASTNodeType.DEFAULT> |
            ASTSwitchNode |
            ASTComparisonOperatorNode |
            ASTUnitaryOperatorNode |
            ASTForNode |
            ASTAssignmentNode |
            ASTBlockNode ;
  