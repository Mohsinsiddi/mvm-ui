// ============================================================
// MOSH LANGUAGE COMPILER v2
// Compiles Mosh language → JSON for MVM
// ============================================================

// ==================== TYPES ====================

export interface CompileResult {
  success: boolean
  json?: MoshContractJSON
  errors: CompileError[]
  warnings: string[]
}

export interface CompileError {
  line: number
  column: number
  message: string
}

export interface MoshContractJSON {
  name: string
  variables: VariableDef[]
  mappings: MappingDef[]
  functions: FunctionDef[]
}

export interface VariableDef {
  name: string
  var_type: string
  default?: string
}

export interface MappingDef {
  name: string
  key_type: string
  value_type: string
}

export interface FunctionDef {
  name: string
  modifiers: string[]
  args: { name: string; arg_type: string }[]
  body: Operation[]
  returns?: string
}

export interface Operation {
  op: string
  var?: string
  value?: any
  map?: string
  key?: any
  left?: any
  right?: any
  cmp?: string
  msg?: string
  to?: any
  amount?: any
}

// ==================== TOKENS ====================

enum TokenType {
  CONTRACT = 'CONTRACT',
  FUNCTION = 'FUNCTION',
  MAPPING = 'MAPPING',
  RETURNS = 'RETURNS',
  RETURN = 'RETURN',
  REQUIRE = 'REQUIRE',
  IF = 'IF',
  ELSE = 'ELSE',
  EMIT = 'EMIT',
  VIEW = 'VIEW',
  WRITE = 'WRITE',
  PAYABLE = 'PAYABLE',
  ONLY_OWNER = 'ONLY_OWNER',
  UINT256 = 'UINT256',
  UINT128 = 'UINT128',
  UINT64 = 'UINT64',
  UINT8 = 'UINT8',
  INT256 = 'INT256',
  STRING = 'STRING',
  ADDRESS = 'ADDRESS',
  BOOL = 'BOOL',
  NUMBER = 'NUMBER',
  STRING_LITERAL = 'STRING_LITERAL',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IDENTIFIER = 'IDENTIFIER',
  MSG_SENDER = 'MSG_SENDER',
  MSG_VALUE = 'MSG_VALUE',
  BLOCK_HEIGHT = 'BLOCK_HEIGHT',
  BLOCK_TIMESTAMP = 'BLOCK_TIMESTAMP',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  PLUS_EQ = 'PLUS_EQ',
  MINUS_EQ = 'MINUS_EQ',
  STAR_EQ = 'STAR_EQ',
  SLASH_EQ = 'SLASH_EQ',
  EQ = 'EQ',
  EQ_EQ = 'EQ_EQ',
  BANG_EQ = 'BANG_EQ',
  LT = 'LT',
  GT = 'GT',
  LT_EQ = 'LT_EQ',
  GT_EQ = 'GT_EQ',
  AND_AND = 'AND_AND',
  OR_OR = 'OR_OR',
  BANG = 'BANG',
  ARROW = 'ARROW',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  DOT = 'DOT',
  EOF = 'EOF',
}

interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

// ==================== LEXER ====================

const KEYWORDS: Record<string, TokenType> = {
  'contract': TokenType.CONTRACT,
  'function': TokenType.FUNCTION,
  'mapping': TokenType.MAPPING,
  'returns': TokenType.RETURNS,
  'return': TokenType.RETURN,
  'require': TokenType.REQUIRE,
  'if': TokenType.IF,
  'else': TokenType.ELSE,
  'emit': TokenType.EMIT,
  'view': TokenType.VIEW,
  'write': TokenType.WRITE,
  'payable': TokenType.PAYABLE,
  'onlyOwner': TokenType.ONLY_OWNER,
  'uint256': TokenType.UINT256,
  'uint128': TokenType.UINT128,
  'uint64': TokenType.UINT64,
  'uint8': TokenType.UINT8,
  'int256': TokenType.INT256,
  'string': TokenType.STRING,
  'address': TokenType.ADDRESS,
  'bool': TokenType.BOOL,
  'true': TokenType.TRUE,
  'false': TokenType.FALSE,
}

class Lexer {
  private source: string
  private tokens: Token[] = []
  private current = 0
  private line = 1
  private column = 1
  private startColumn = 1

  constructor(source: string) {
    this.source = source
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.startColumn = this.column
      this.scanToken()
    }
    this.tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column })
    return this.tokens
  }

  private scanToken() {
    const c = this.advance()

    switch (c) {
      case '(': this.addToken(TokenType.LPAREN, c); break
      case ')': this.addToken(TokenType.RPAREN, c); break
      case '{': this.addToken(TokenType.LBRACE, c); break
      case '}': this.addToken(TokenType.RBRACE, c); break
      case '[': this.addToken(TokenType.LBRACKET, c); break
      case ']': this.addToken(TokenType.RBRACKET, c); break
      case ',': this.addToken(TokenType.COMMA, c); break
      case ';': this.addToken(TokenType.SEMICOLON, c); break
      case ':': this.addToken(TokenType.COLON, c); break
      case '.': this.addToken(TokenType.DOT, c); break
      case '+':
        if (this.match('=')) { this.addToken(TokenType.PLUS_EQ, '+=') }
        else { this.addToken(TokenType.PLUS, '+') }
        break
      case '-':
        if (this.match('=')) { this.addToken(TokenType.MINUS_EQ, '-=') }
        else { this.addToken(TokenType.MINUS, '-') }
        break
      case '*':
        if (this.match('=')) { this.addToken(TokenType.STAR_EQ, '*=') }
        else { this.addToken(TokenType.STAR, '*') }
        break
      case '%': this.addToken(TokenType.PERCENT, c); break
      case '=':
        if (this.match('=')) { this.addToken(TokenType.EQ_EQ, '==') }
        else if (this.match('>')) { this.addToken(TokenType.ARROW, '=>') }
        else { this.addToken(TokenType.EQ, '=') }
        break
      case '!':
        if (this.match('=')) { this.addToken(TokenType.BANG_EQ, '!=') }
        else { this.addToken(TokenType.BANG, '!') }
        break
      case '<':
        if (this.match('=')) { this.addToken(TokenType.LT_EQ, '<=') }
        else { this.addToken(TokenType.LT, '<') }
        break
      case '>':
        if (this.match('=')) { this.addToken(TokenType.GT_EQ, '>=') }
        else { this.addToken(TokenType.GT, '>') }
        break
      case '&':
        if (this.match('&')) this.addToken(TokenType.AND_AND, '&&')
        break
      case '|':
        if (this.match('|')) this.addToken(TokenType.OR_OR, '||')
        break
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        } else if (this.match('*')) {
          while (!(this.peek() === '*' && this.peekNext() === '/') && !this.isAtEnd()) {
            if (this.peek() === '\n') { this.line++; this.column = 0 }
            this.advance()
          }
          if (!this.isAtEnd()) { this.advance(); this.advance() }
        } else if (this.match('=')) {
          this.addToken(TokenType.SLASH_EQ, '/=')
        } else {
          this.addToken(TokenType.SLASH, '/')
        }
        break
      case ' ':
      case '\r':
      case '\t':
        break
      case '\n':
        this.line++
        this.column = 0
        break
      case '"':
      case "'":
        this.string(c)
        break
      default:
        if (this.isDigit(c)) {
          this.number(c)
        } else if (this.isAlpha(c)) {
          this.identifier(c)
        }
    }
  }

  private string(quote: string) {
    let value = ''
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') { this.line++; this.column = 0 }
      if (this.peek() === '\\') {
        this.advance()
        const escaped = this.advance()
        switch (escaped) {
          case 'n': value += '\n'; break
          case 't': value += '\t'; break
          case '"': value += '"'; break
          case "'": value += "'"; break
          case '\\': value += '\\'; break
          default: value += escaped
        }
      } else {
        value += this.advance()
      }
    }
    if (this.isAtEnd()) throw new Error(`Unterminated string at line ${this.line}`)
    this.advance()
    this.addToken(TokenType.STRING_LITERAL, value)
  }

  private number(first: string) {
    let value = first
    while (this.isDigit(this.peek())) value += this.advance()
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance()
      while (this.isDigit(this.peek())) value += this.advance()
    }
    this.addToken(TokenType.NUMBER, value)
  }

  private identifier(first: string) {
    let value = first
    while (this.isAlphaNumeric(this.peek())) value += this.advance()
    
    // Check for msg.sender, msg.value
    if (value === 'msg' && this.peek() === '.') {
      this.advance()
      let prop = ''
      while (this.isAlphaNumeric(this.peek())) prop += this.advance()
      if (prop === 'sender') { this.addToken(TokenType.MSG_SENDER, 'msg.sender'); return }
      if (prop === 'value') { this.addToken(TokenType.MSG_VALUE, 'msg.value'); return }
    }
    
    // Check for block.height, block.timestamp
    if (value === 'block' && this.peek() === '.') {
      this.advance()
      let prop = ''
      while (this.isAlphaNumeric(this.peek())) prop += this.advance()
      if (prop === 'height') { this.addToken(TokenType.BLOCK_HEIGHT, 'block.height'); return }
      if (prop === 'timestamp') { this.addToken(TokenType.BLOCK_TIMESTAMP, 'block.timestamp'); return }
    }

    const type = KEYWORDS[value] || TokenType.IDENTIFIER
    this.addToken(type, value)
  }

  private addToken(type: TokenType, value: string) {
    this.tokens.push({ type, value, line: this.line, column: this.startColumn })
  }

  private advance(): string { this.column++; return this.source[this.current++] }
  private peek(): string { return this.isAtEnd() ? '\0' : this.source[this.current] }
  private peekNext(): string { return this.current + 1 >= this.source.length ? '\0' : this.source[this.current + 1] }
  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) return false
    this.current++; this.column++; return true
  }
  private isAtEnd(): boolean { return this.current >= this.source.length }
  private isDigit(c: string): boolean { return c >= '0' && c <= '9' }
  private isAlpha(c: string): boolean { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' }
  private isAlphaNumeric(c: string): boolean { return this.isAlpha(c) || this.isDigit(c) }
}

// ==================== PARSER ====================

class Parser {
  private tokens: Token[]
  private current = 0
  private errors: CompileError[] = []

  constructor(tokens: Token[]) { this.tokens = tokens }

  parse(): { contract: MoshContractJSON | null; errors: CompileError[] } {
    try {
      const contract = this.parseContract()
      return { contract, errors: this.errors }
    } catch (e: any) {
      this.errors.push({ line: this.peek().line, column: this.peek().column, message: e.message })
      return { contract: null, errors: this.errors }
    }
  }

  private parseContract(): MoshContractJSON {
    this.consume(TokenType.CONTRACT, "Expected 'contract' keyword")
    const name = this.consume(TokenType.IDENTIFIER, "Expected contract name").value
    this.consume(TokenType.LBRACE, "Expected '{' after contract name")

    const variables: VariableDef[] = []
    const mappings: MappingDef[] = []
    const functions: FunctionDef[] = []

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.check(TokenType.MAPPING)) mappings.push(this.parseMapping())
      else if (this.check(TokenType.FUNCTION)) functions.push(this.parseFunction())
      else if (this.isType()) variables.push(this.parseVariable())
      else throw new Error(`Unexpected token: ${this.peek().value}`)
    }

    this.consume(TokenType.RBRACE, "Expected '}' at end of contract")
    return { name, variables, mappings, functions }
  }

  private parseVariable(): VariableDef {
    const varType = this.parseType()
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value
    let defaultValue: string | undefined
    if (this.match(TokenType.EQ)) defaultValue = this.parseDefaultValue()
    this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration")
    return { name, var_type: varType, default: defaultValue }
  }

  // Parse default value - NOW supports msg.sender, block.timestamp etc!
  private parseDefaultValue(): string {
    const token = this.peek()
    if (this.match(TokenType.NUMBER)) return token.value
    if (this.match(TokenType.STRING_LITERAL)) return token.value
    if (this.match(TokenType.TRUE)) return 'true'
    if (this.match(TokenType.FALSE)) return 'false'
    if (this.match(TokenType.MSG_SENDER)) return 'msg.sender'
    if (this.match(TokenType.MSG_VALUE)) return 'msg.value'
    if (this.match(TokenType.BLOCK_HEIGHT)) return 'block.height'
    if (this.match(TokenType.BLOCK_TIMESTAMP)) return 'block.timestamp'
    if (this.check(TokenType.IDENTIFIER)) return this.advance().value
    throw new Error(`Expected default value, got: ${token.value}`)
  }

  private parseMapping(): MappingDef {
    this.consume(TokenType.MAPPING, "Expected 'mapping'")
    this.consume(TokenType.LPAREN, "Expected '(' after mapping")
    const keyType = this.parseType()
    this.consume(TokenType.ARROW, "Expected '=>' in mapping")
    const valueType = this.parseType()
    this.consume(TokenType.RPAREN, "Expected ')' after mapping type")
    const name = this.consume(TokenType.IDENTIFIER, "Expected mapping name").value
    this.consume(TokenType.SEMICOLON, "Expected ';' after mapping")
    return { name, key_type: keyType, value_type: valueType }
  }

  private parseFunction(): FunctionDef {
    this.consume(TokenType.FUNCTION, "Expected 'function'")
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value
    
    this.consume(TokenType.LPAREN, "Expected '(' after function name")
    const args: { name: string; arg_type: string }[] = []
    if (!this.check(TokenType.RPAREN)) {
      do {
        const argType = this.parseType()
        const argName = this.consume(TokenType.IDENTIFIER, "Expected argument name").value
        args.push({ name: argName, arg_type: argType })
      } while (this.match(TokenType.COMMA))
    }
    this.consume(TokenType.RPAREN, "Expected ')' after arguments")

    const modifiers: string[] = []
    while (this.check(TokenType.VIEW) || this.check(TokenType.WRITE) || 
           this.check(TokenType.PAYABLE) || this.check(TokenType.ONLY_OWNER)) {
      const mod = this.advance().value
      modifiers.push(mod.charAt(0).toUpperCase() + mod.slice(1))
    }

    let returns: string | undefined
    if (this.match(TokenType.RETURNS)) returns = this.parseType()

    this.consume(TokenType.LBRACE, "Expected '{' before function body")
    const body: Operation[] = []
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const op = this.parseStatement()
      if (op) body.push(op)
    }
    this.consume(TokenType.RBRACE, "Expected '}' after function body")

    return { name, modifiers, args, body, returns }
  }

  private parseStatement(): Operation | null {
    if (this.match(TokenType.REQUIRE)) {
      this.consume(TokenType.LPAREN, "Expected '(' after require")
      const condition = this.parseExpression()
      let msg = "Requirement failed"
      if (this.match(TokenType.COMMA)) msg = this.consume(TokenType.STRING_LITERAL, "Expected error message").value
      this.consume(TokenType.RPAREN, "Expected ')' after require")
      this.consume(TokenType.SEMICOLON, "Expected ';' after require")
      return { op: 'require', left: condition.left, cmp: condition.cmp, right: condition.right, msg }
    }

    if (this.match(TokenType.RETURN)) {
      const value = this.parseValueExpr()
      this.consume(TokenType.SEMICOLON, "Expected ';' after return")
      return { op: 'return', var: String(value) }
    }

    if (this.peek().value === 'transfer' && this.check(TokenType.IDENTIFIER)) {
      this.advance()
      this.consume(TokenType.LPAREN, "Expected '(' after transfer")
      const to = this.parseValueExpr()
      this.consume(TokenType.COMMA, "Expected ',' in transfer")
      const amount = this.parseValueExpr()
      this.consume(TokenType.RPAREN, "Expected ')' after transfer")
      this.consume(TokenType.SEMICOLON, "Expected ';' after transfer")
      return { op: 'transfer', to, amount }
    }

    if (this.match(TokenType.EMIT)) {
      const eventName = this.consume(TokenType.IDENTIFIER, "Expected event name").value
      this.consume(TokenType.LPAREN, "Expected '(' after event name")
      const eventArgs: any[] = []
      if (!this.check(TokenType.RPAREN)) {
        do { eventArgs.push(this.parseValueExpr()) } while (this.match(TokenType.COMMA))
      }
      this.consume(TokenType.RPAREN, "Expected ')' after event args")
      this.consume(TokenType.SEMICOLON, "Expected ';' after emit")
      return { op: 'emit', var: eventName, value: eventArgs }
    }

    return this.parseAssignmentTarget()
  }

  private parseAssignmentTarget(): Operation | null {
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value
      
      if (this.match(TokenType.LBRACKET)) {
        const key = this.parseValueExpr()
        this.consume(TokenType.RBRACKET, "Expected ']' after mapping key")
        
        if (this.match(TokenType.PLUS_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'add_map', map: name, key, value }
        } else if (this.match(TokenType.MINUS_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'sub_map', map: name, key, value }
        } else if (this.match(TokenType.EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'set_map', map: name, key, value }
        }
      }
      
      if (this.match(TokenType.PLUS_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'add', var: name, value }
      } else if (this.match(TokenType.MINUS_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'sub', var: name, value }
      } else if (this.match(TokenType.STAR_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'mul', var: name, value }
      } else if (this.match(TokenType.SLASH_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'div', var: name, value }
      } else if (this.match(TokenType.EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'set', var: name, value }
      }
    }
    return null
  }

  private parseExpression(): { left: any; cmp?: string; right?: any } {
    const left = this.parseValueExpr()
    if (this.check(TokenType.EQ_EQ) || this.check(TokenType.BANG_EQ) ||
        this.check(TokenType.LT) || this.check(TokenType.GT) ||
        this.check(TokenType.LT_EQ) || this.check(TokenType.GT_EQ)) {
      const op = this.advance()
      const right = this.parseValueExpr()
      return { left, cmp: op.value, right }
    }
    return { left }
  }

  private parseValueExpr(): any {
    const token = this.peek()
    if (this.match(TokenType.NUMBER)) return parseInt(token.value)
    if (this.match(TokenType.STRING_LITERAL)) return token.value
    if (this.match(TokenType.TRUE)) return true
    if (this.match(TokenType.FALSE)) return false
    if (this.match(TokenType.MSG_SENDER)) return 'msg.sender'
    if (this.match(TokenType.MSG_VALUE)) return 'msg.value'
    if (this.match(TokenType.BLOCK_HEIGHT)) return 'block.height'
    if (this.match(TokenType.BLOCK_TIMESTAMP)) return 'block.timestamp'
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value
      if (this.match(TokenType.LBRACKET)) {
        const key = this.parseValueExpr()
        this.consume(TokenType.RBRACKET, "Expected ']'")
        return `${name}[${typeof key === 'string' ? key : JSON.stringify(key)}]`
      }
      return name
    }
    throw new Error(`Unexpected token in expression: ${token.value}`)
  }

  private parseType(): string {
    const token = this.peek()
    if (this.isType()) { this.advance(); return token.value.toLowerCase() }
    throw new Error(`Expected type, got: ${token.value}`)
  }

  private isType(): boolean {
    return this.check(TokenType.UINT256) || this.check(TokenType.UINT128) ||
           this.check(TokenType.UINT64) || this.check(TokenType.UINT8) ||
           this.check(TokenType.INT256) || this.check(TokenType.STRING) ||
           this.check(TokenType.ADDRESS) || this.check(TokenType.BOOL)
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) { if (this.check(type)) { this.advance(); return true } }
    return false
  }
  private check(type: TokenType): boolean { return !this.isAtEnd() && this.peek().type === type }
  private advance(): Token { if (!this.isAtEnd()) this.current++; return this.previous() }
  private isAtEnd(): boolean { return this.peek().type === TokenType.EOF }
  private peek(): Token { return this.tokens[this.current] }
  private previous(): Token { return this.tokens[this.current - 1] }
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    throw new Error(`${message}. Got '${this.peek().value}' at line ${this.peek().line}`)
  }
}

// ==================== COMPILER ====================

export function compile(source: string): CompileResult {
  const errors: CompileError[] = []
  const warnings: string[] = []

  try {
    const lexer = new Lexer(source)
    const tokens = lexer.tokenize()
    const parser = new Parser(tokens)
    const { contract, errors: parseErrors } = parser.parse()

    if (parseErrors.length > 0) return { success: false, errors: parseErrors, warnings }
    if (!contract) return { success: false, errors: [{ line: 1, column: 1, message: 'Failed to parse contract' }], warnings }
    if (!contract.name) errors.push({ line: 1, column: 1, message: 'Contract must have a name' })
    if (contract.functions.length === 0) warnings.push('Contract has no functions')

    for (const fn of contract.functions) {
      if (fn.modifiers.includes('View') && !fn.returns) {
        warnings.push(`View function '${fn.name}' has no return type`)
      }
    }

    if (errors.length > 0) return { success: false, errors, warnings }
    return { success: true, json: contract, errors: [], warnings }
  } catch (e: any) {
    return { success: false, errors: [{ line: 1, column: 1, message: e.message }], warnings }
  }
}

// ==================== SAMPLE CONTRACTS ====================

export const SAMPLE_CONTRACTS = {
  counter: `contract Counter {
    // State variables
    uint256 count = 0;

    // Increment counter
    function increment() write {
        count += 1;
    }

    // Decrement counter  
    function decrement() write {
        require(count > 0, "Count cannot go below zero");
        count -= 1;
    }

    // Get current count
    function getCount() view returns uint256 {
        return count;
    }

    // Set count directly
    function setCount(uint256 newCount) write {
        count = newCount;
    }
}`,

  token: `contract SimpleToken {
    // Token metadata
    string name = "MyToken";
    string symbol = "MTK";
    uint256 totalSupply = 1000000;
    uint8 decimals = 18;

    // Balances mapping
    mapping(address => uint256) balances;

    // Transfer tokens
    function transfer(address to, uint256 amount) write {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    // Get balance
    function balanceOf(address account) view returns uint256 {
        return balances[account];
    }

    // Mint new tokens
    function mint(address to, uint256 amount) write {
        balances[to] += amount;
        totalSupply += amount;
    }
}`,

  vault: `contract StakingVault {
    // State
    uint256 totalStaked = 0;
    uint256 rewardRate = 100;

    // Mappings
    mapping(address => uint256) stakes;

    // Stake MVM
    function stake() payable {
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
    }

    // Unstake MVM
    function unstake(uint256 amount) write {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        transfer(msg.sender, amount);
    }

    // Get stake balance
    function getStake(address account) view returns uint256 {
        return stakes[account];
    }

    // Get total staked
    function getTotalStaked() view returns uint256 {
        return totalStaked;
    }
}`,

  empty: `contract MyContract {
    // Variables
    uint256 value = 0;

    // Set value
    function setValue(uint256 newValue) write {
        value = newValue;
    }

    // Get value
    function getValue() view returns uint256 {
        return value;
    }
}`
}