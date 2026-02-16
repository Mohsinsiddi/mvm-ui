// ============================================================
// MOSH LANGUAGE COMPILER v3
// Compiles Mosh language → JSON for MVM
// Supports unique Mosh syntax (forge, fn, let, map, guard, signal, vault, seal)
// + backwards-compatible with Solidity-style keywords
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
  line?: number
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
  condition?: { left: any; cmp: string; right: any }
  then_body?: Operation[]
  else_body?: Operation[]
  event_name?: string
  event_args?: any[]
  line?: number
}

// ==================== TOKENS ====================

enum TokenType {
  // Contract definition
  CONTRACT = 'CONTRACT',       // contract / forge
  FUNCTION = 'FUNCTION',       // function / fn
  MAPPING = 'MAPPING',         // mapping / map
  LET = 'LET',                 // let (Mosh variable decl)
  RETURNS = 'RETURNS',         // returns
  RETURN = 'RETURN',
  REQUIRE = 'REQUIRE',         // require / guard
  IF = 'IF',
  ELSE = 'ELSE',
  EMIT = 'EMIT',               // emit / signal
  // Modifiers
  VIEW = 'VIEW',               // view / pub
  WRITE = 'WRITE',             // write / mut
  PAYABLE = 'PAYABLE',         // payable / vault
  ONLY_OWNER = 'ONLY_OWNER',   // onlyOwner / seal
  // Types
  UINT256 = 'UINT256',
  UINT128 = 'UINT128',
  UINT64 = 'UINT64',
  UINT8 = 'UINT8',
  INT256 = 'INT256',
  STRING = 'STRING',
  ADDRESS = 'ADDRESS',
  BOOL = 'BOOL',
  // Literals
  NUMBER = 'NUMBER',
  STRING_LITERAL = 'STRING_LITERAL',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IDENTIFIER = 'IDENTIFIER',
  // Special values
  MSG_SENDER = 'MSG_SENDER',
  MSG_VALUE = 'MSG_VALUE',
  BLOCK_HEIGHT = 'BLOCK_HEIGHT',
  BLOCK_TIMESTAMP = 'BLOCK_TIMESTAMP',
  MOSH_BALANCE = 'MOSH_BALANCE',
  MOSH_HEIGHT = 'MOSH_HEIGHT',
  MOSH_TIME = 'MOSH_TIME',
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  PLUS_EQ = 'PLUS_EQ',
  MINUS_EQ = 'MINUS_EQ',
  STAR_EQ = 'STAR_EQ',
  SLASH_EQ = 'SLASH_EQ',
  PERCENT_EQ = 'PERCENT_EQ',
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
  ARROW = 'ARROW',             // => (mapping)
  THIN_ARROW = 'THIN_ARROW',   // -> (return type)
  // Delimiters
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
  // Standard keywords
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
  // Mosh unique keywords
  'forge': TokenType.CONTRACT,
  'fn': TokenType.FUNCTION,
  'map': TokenType.MAPPING,
  'let': TokenType.LET,
  'guard': TokenType.REQUIRE,
  'signal': TokenType.EMIT,
  'pub': TokenType.VIEW,
  'mut': TokenType.WRITE,
  'vault': TokenType.PAYABLE,
  'seal': TokenType.ONLY_OWNER,
  // Types (standard)
  'uint256': TokenType.UINT256,
  'uint128': TokenType.UINT128,
  'uint64': TokenType.UINT64,
  'uint8': TokenType.UINT8,
  'int256': TokenType.INT256,
  'string': TokenType.STRING,
  'address': TokenType.ADDRESS,
  'bool': TokenType.BOOL,
  // Mosh short type aliases
  'u256': TokenType.UINT256,
  'u128': TokenType.UINT128,
  'u64': TokenType.UINT64,
  'u32': TokenType.UINT64,
  'u16': TokenType.UINT64,
  'u8': TokenType.UINT8,
  // Literals
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
        if (this.match('>')) { this.addToken(TokenType.THIN_ARROW, '->') }
        else if (this.match('=')) { this.addToken(TokenType.MINUS_EQ, '-=') }
        else { this.addToken(TokenType.MINUS, '-') }
        break
      case '*':
        if (this.match('=')) { this.addToken(TokenType.STAR_EQ, '*=') }
        else { this.addToken(TokenType.STAR, '*') }
        break
      case '%':
        if (this.match('=')) { this.addToken(TokenType.PERCENT_EQ, '%=') }
        else { this.addToken(TokenType.PERCENT, '%') }
        break
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

    // Check for dotted special values: msg.sender, msg.value, block.height, block.timestamp, mosh.balance, mosh.height, mosh.time
    if ((value === 'msg' || value === 'block' || value === 'mosh') && this.peek() === '.') {
      this.advance() // consume '.'
      let prop = ''
      while (this.isAlphaNumeric(this.peek())) prop += this.advance()

      if (value === 'msg') {
        if (prop === 'sender') { this.addToken(TokenType.MSG_SENDER, 'msg.sender'); return }
        if (prop === 'value') { this.addToken(TokenType.MSG_VALUE, 'msg.value'); return }
      } else if (value === 'block') {
        if (prop === 'height') { this.addToken(TokenType.BLOCK_HEIGHT, 'block.height'); return }
        if (prop === 'timestamp') { this.addToken(TokenType.BLOCK_TIMESTAMP, 'block.timestamp'); return }
      } else if (value === 'mosh') {
        if (prop === 'balance') { this.addToken(TokenType.MOSH_BALANCE, 'mosh.balance'); return }
        if (prop === 'height') { this.addToken(TokenType.MOSH_HEIGHT, 'mosh.height'); return }
        if (prop === 'time') { this.addToken(TokenType.MOSH_TIME, 'mosh.time'); return }
      }
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
    // Accept both 'contract' and 'forge'
    this.consume(TokenType.CONTRACT, "Expected 'forge' or 'contract' keyword")
    const name = this.consume(TokenType.IDENTIFIER, "Expected contract name").value
    this.consume(TokenType.LBRACE, "Expected '{' after contract name")

    const variables: VariableDef[] = []
    const mappings: MappingDef[] = []
    const functions: FunctionDef[] = []

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // Mosh 'let' syntax: let name: type = default;
      if (this.check(TokenType.LET)) {
        variables.push(this.parseMoshVariable())
      }
      // Mosh 'map' syntax: map name: keyType => valType;
      else if (this.check(TokenType.MAPPING)) {
        mappings.push(this.parseMapping())
      }
      // Function: 'function' or 'fn'
      else if (this.check(TokenType.FUNCTION)) {
        functions.push(this.parseFunction())
      }
      // Old-style: type name = default; (e.g. uint256 count = 0;)
      else if (this.isType()) {
        variables.push(this.parseOldVariable())
      }
      else {
        throw new Error(`Unexpected token: ${this.peek().value}`)
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' at end of contract")
    return { name, variables, mappings, functions }
  }

  // Mosh style: let name: type = default;
  private parseMoshVariable(): VariableDef {
    this.consume(TokenType.LET, "Expected 'let'")
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value
    this.consume(TokenType.COLON, "Expected ':' after variable name")
    const varType = this.parseType()
    let defaultValue: string | undefined
    if (this.match(TokenType.EQ)) defaultValue = this.parseDefaultValue()
    this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration")
    return { name, var_type: varType, default: defaultValue }
  }

  // Old style: type name = default;
  private parseOldVariable(): VariableDef {
    const varType = this.parseType()
    const name = this.consume(TokenType.IDENTIFIER, "Expected variable name").value
    let defaultValue: string | undefined
    if (this.match(TokenType.EQ)) defaultValue = this.parseDefaultValue()
    this.consume(TokenType.SEMICOLON, "Expected ';' after variable declaration")
    return { name, var_type: varType, default: defaultValue }
  }

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
    if (this.match(TokenType.MOSH_BALANCE)) return 'mosh.balance'
    if (this.match(TokenType.MOSH_HEIGHT)) return 'mosh.height'
    if (this.match(TokenType.MOSH_TIME)) return 'mosh.time'
    if (this.check(TokenType.IDENTIFIER)) return this.advance().value
    throw new Error(`Expected default value, got: ${token.value}`)
  }

  private parseMapping(): MappingDef {
    this.consume(TokenType.MAPPING, "Expected 'mapping' or 'map'")

    // Detect which syntax:
    // Old: mapping(keyType => valType) name;
    // Mosh: map name: keyType => valType;
    if (this.check(TokenType.LPAREN)) {
      // Old style: mapping(keyType => valType) name;
      this.consume(TokenType.LPAREN, "Expected '('")
      const keyType = this.parseType()
      this.consume(TokenType.ARROW, "Expected '=>'")
      const valueType = this.parseType()
      this.consume(TokenType.RPAREN, "Expected ')'")
      const name = this.consume(TokenType.IDENTIFIER, "Expected mapping name").value
      this.consume(TokenType.SEMICOLON, "Expected ';'")
      return { name, key_type: keyType, value_type: valueType }
    } else {
      // Mosh style: map name: keyType => valType;
      const name = this.consume(TokenType.IDENTIFIER, "Expected mapping name").value
      this.consume(TokenType.COLON, "Expected ':' after mapping name")
      const keyType = this.parseType()
      this.consume(TokenType.ARROW, "Expected '=>'")
      const valueType = this.parseType()
      this.consume(TokenType.SEMICOLON, "Expected ';'")
      return { name, key_type: keyType, value_type: valueType }
    }
  }

  private parseFunction(): FunctionDef {
    const fnLine = this.peek().line
    this.consume(TokenType.FUNCTION, "Expected 'function' or 'fn'")
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value

    this.consume(TokenType.LPAREN, "Expected '(' after function name")
    const args: { name: string; arg_type: string }[] = []
    if (!this.check(TokenType.RPAREN)) {
      do {
        // Support both: "type name" (old) and "name: type" (Mosh)
        if (this.isType()) {
          // Old style: type name
          const argType = this.parseType()
          const argName = this.consume(TokenType.IDENTIFIER, "Expected argument name").value
          args.push({ name: argName, arg_type: argType })
        } else if (this.check(TokenType.IDENTIFIER)) {
          // Mosh style: name: type
          const argName = this.advance().value
          this.consume(TokenType.COLON, "Expected ':' after argument name")
          const argType = this.parseType()
          args.push({ name: argName, arg_type: argType })
        }
      } while (this.match(TokenType.COMMA))
    }
    this.consume(TokenType.RPAREN, "Expected ')'")

    // Parse modifiers (can appear before or after return type)
    const modifiers: string[] = []
    const parseModifiers = () => {
      while (this.check(TokenType.VIEW) || this.check(TokenType.WRITE) ||
             this.check(TokenType.PAYABLE) || this.check(TokenType.ONLY_OWNER)) {
        const mod = this.advance()
        // Normalize modifier names
        switch (mod.type) {
          case TokenType.VIEW: modifiers.push('View'); break
          case TokenType.WRITE: modifiers.push('Write'); break
          case TokenType.PAYABLE: modifiers.push('Payable'); break
          case TokenType.ONLY_OWNER: modifiers.push('OnlyOwner'); break
        }
      }
    }

    parseModifiers()

    // Parse return type — support both 'returns type' and '-> type'
    let returns: string | undefined
    if (this.match(TokenType.RETURNS)) {
      returns = this.parseType()
    } else if (this.match(TokenType.THIN_ARROW)) {
      returns = this.parseType()
    }

    // Parse modifiers again (they could appear after return type)
    parseModifiers()

    this.consume(TokenType.LBRACE, "Expected '{' before function body")
    const body: Operation[] = []
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const op = this.parseStatement()
      if (op) body.push(op)
    }
    this.consume(TokenType.RBRACE, "Expected '}' after function body")

    return { name, modifiers, args, body, returns, line: fnLine }
  }

  private parseStatement(): Operation | null {
    const stmtLine = this.peek().line

    // require / guard
    if (this.match(TokenType.REQUIRE)) {
      this.consume(TokenType.LPAREN, "Expected '(' after require/guard")
      const condition = this.parseExpression()
      let msg = "Requirement failed"
      if (this.match(TokenType.COMMA)) msg = this.consume(TokenType.STRING_LITERAL, "Expected error message").value
      this.consume(TokenType.RPAREN, "Expected ')'")
      this.consume(TokenType.SEMICOLON, "Expected ';'")
      return { op: 'require', left: condition.left, cmp: condition.cmp, right: condition.right, msg, line: stmtLine }
    }

    // return
    if (this.match(TokenType.RETURN)) {
      const value = this.parseValueExpr()
      this.consume(TokenType.SEMICOLON, "Expected ';' after return")
      return { op: 'return', value: String(value), line: stmtLine }
    }

    // transfer(to, amount)
    if (this.peek().value === 'transfer' && this.check(TokenType.IDENTIFIER)) {
      this.advance()
      this.consume(TokenType.LPAREN, "Expected '(' after transfer")
      const to = this.parseValueExpr()
      this.consume(TokenType.COMMA, "Expected ',' in transfer")
      const amount = this.parseValueExpr()
      this.consume(TokenType.RPAREN, "Expected ')'")
      this.consume(TokenType.SEMICOLON, "Expected ';'")
      return { op: 'transfer', to, amount, line: stmtLine }
    }

    // emit / signal
    if (this.match(TokenType.EMIT)) {
      const eventName = this.consume(TokenType.IDENTIFIER, "Expected event name").value
      this.consume(TokenType.LPAREN, "Expected '(' after event name")
      const eventArgs: any[] = []
      if (!this.check(TokenType.RPAREN)) {
        do { eventArgs.push(this.parseValueExpr()) } while (this.match(TokenType.COMMA))
      }
      this.consume(TokenType.RPAREN, "Expected ')'")
      this.consume(TokenType.SEMICOLON, "Expected ';'")
      return { op: 'emit', event_name: eventName, event_args: eventArgs, line: stmtLine }
    }

    // if/else
    if (this.match(TokenType.IF)) {
      this.consume(TokenType.LPAREN, "Expected '(' after if")
      const condition = this.parseExpression()
      this.consume(TokenType.RPAREN, "Expected ')' after condition")
      this.consume(TokenType.LBRACE, "Expected '{'")
      const thenBody: Operation[] = []
      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        const op = this.parseStatement()
        if (op) thenBody.push(op)
      }
      this.consume(TokenType.RBRACE, "Expected '}'")

      let elseBody: Operation[] | undefined
      if (this.match(TokenType.ELSE)) {
        this.consume(TokenType.LBRACE, "Expected '{' after else")
        elseBody = []
        while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
          const op = this.parseStatement()
          if (op) elseBody.push(op)
        }
        this.consume(TokenType.RBRACE, "Expected '}'")
      }

      return {
        op: 'if',
        condition: { left: condition.left, cmp: condition.cmp || '!=', right: condition.right ?? 0 },
        then_body: thenBody,
        else_body: elseBody,
        line: stmtLine,
      }
    }

    return this.parseAssignmentTarget(stmtLine)
  }

  private parseAssignmentTarget(stmtLine: number): Operation | null {
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value

      // Mapping access: name[key] op= value
      if (this.match(TokenType.LBRACKET)) {
        const key = this.parseValueExpr()
        this.consume(TokenType.RBRACKET, "Expected ']'")

        if (this.match(TokenType.PLUS_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'map_add', map: name, key, value, line: stmtLine }
        } else if (this.match(TokenType.MINUS_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'map_sub', map: name, key, value, line: stmtLine }
        } else if (this.match(TokenType.STAR_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'map_mul', map: name, key, value, line: stmtLine }
        } else if (this.match(TokenType.SLASH_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'map_div', map: name, key, value, line: stmtLine }
        } else if (this.match(TokenType.PERCENT_EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'map_mod', map: name, key, value, line: stmtLine }
        } else if (this.match(TokenType.EQ)) {
          const value = this.parseValueExpr()
          this.consume(TokenType.SEMICOLON, "Expected ';'")
          return { op: 'map_set', map: name, key, value, line: stmtLine }
        }
      }

      // Variable assignment: name op= value
      if (this.match(TokenType.PLUS_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'add', var: name, value, line: stmtLine }
      } else if (this.match(TokenType.MINUS_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'sub', var: name, value, line: stmtLine }
      } else if (this.match(TokenType.STAR_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'mul', var: name, value, line: stmtLine }
      } else if (this.match(TokenType.SLASH_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'div', var: name, value, line: stmtLine }
      } else if (this.match(TokenType.PERCENT_EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'mod', var: name, value, line: stmtLine }
      } else if (this.match(TokenType.EQ)) {
        const value = this.parseValueExpr()
        this.consume(TokenType.SEMICOLON, "Expected ';'")
        return { op: 'set', var: name, value, line: stmtLine }
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
    if (this.match(TokenType.MOSH_BALANCE)) return 'mosh.balance'
    if (this.match(TokenType.MOSH_HEIGHT)) return 'mosh.height'
    if (this.match(TokenType.MOSH_TIME)) return 'mosh.time'
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
    if (this.isType()) {
      this.advance()
      // Normalize Mosh short types to backend-expected types
      const typeMap: Record<string, string> = {
        'u256': 'uint256', 'u128': 'uint128', 'u64': 'uint64', 'u32': 'uint64', 'u16': 'uint64', 'u8': 'uint8'
      }
      return typeMap[token.value.toLowerCase()] || token.value.toLowerCase()
    }
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

    const declaredVars = new Set(contract.variables.map(v => v.name))
    const declaredMappings = new Set(contract.mappings.map(m => m.name))

    for (const fn of contract.functions) {
      const fnLine = fn.line || 1

      if (fn.modifiers.includes('View') && !fn.returns) {
        warnings.push(`View function '${fn.name}' has no return type`)
      }

      const argNames = new Set(fn.args.map(a => a.name))

      const checkOps = (ops: Operation[]) => {
        for (const op of ops) {
          const opLine = op.line || fnLine

          // Check variable references
          if (op.var && !['emit', 'if'].includes(op.op)) {
            if (!declaredVars.has(op.var) && !argNames.has(op.var)) {
              errors.push({ line: opLine, column: 1, message: `Undefined variable '${op.var}'` })
            }
          }

          // Check mapping references
          if (op.map) {
            if (!declaredMappings.has(op.map)) {
              errors.push({ line: opLine, column: 1, message: `Undefined mapping '${op.map}'` })
            }
          }

          // Check value references
          if (op.value !== undefined && op.value !== null && typeof op.value === 'string') {
            const val = op.value
            if (!val.startsWith('msg.') && !val.startsWith('block.') && !val.startsWith('mosh.') &&
                !val.startsWith('contract.') && !declaredVars.has(val) && !declaredMappings.has(val) &&
                !argNames.has(val) && isNaN(Number(val)) && val !== 'true' && val !== 'false' &&
                !val.includes('[') && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val)) {
              errors.push({ line: opLine, column: 1, message: `Undefined variable '${val}'` })
            }
          }

          // Check left operand
          if (op.left !== undefined && op.left !== null) {
            const val = typeof op.left === 'string' ? op.left : String(op.left)
            if (!val.startsWith('msg.') && !val.startsWith('block.') && !val.startsWith('mosh.') &&
                !declaredVars.has(val) && !declaredMappings.has(val) && !argNames.has(val) &&
                isNaN(Number(val)) && !val.includes('[') && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val)) {
              errors.push({ line: opLine, column: 1, message: `Undefined variable '${val}'` })
            }
          }

          // Recurse into if/else bodies
          if (op.then_body) checkOps(op.then_body)
          if (op.else_body) checkOps(op.else_body)
        }
      }

      checkOps(fn.body)
    }

    if (errors.length > 0) return { success: false, errors, warnings }
    return { success: true, json: contract, errors: [], warnings }
  } catch (e: any) {
    return { success: false, errors: [{ line: 1, column: 1, message: e.message }], warnings }
  }
}

// ==================== SAMPLE CONTRACTS ====================

export const SAMPLE_CONTRACTS = {
  counter: `forge Counter {
    // State — Mosh uses 'let' and Rust-style types
    let count: u256 = 0;

    // Increment counter
    fn increment() mut {
        count += 1;
        signal CountChanged(count);
    }

    // Decrement counter
    fn decrement() mut {
        guard(count > 0, "Count cannot go below zero");
        count -= 1;
    }

    // Get current count
    fn getCount() pub -> u256 {
        return count;
    }

    // Set count directly
    fn setCount(newCount: u256) mut {
        count = newCount;
    }
}`,

  token: `// ============================================
// MVM-20 Token Standard - SimpleToken
// ============================================
// A fungible token on the MVM blockchain.
//
// KEY CONCEPTS:
// - MVM (native coin) is used to pay gas fees
//   for all transactions including token transfers
// - This token (MTK) is a SEPARATE asset from MVM
// - Users need MVM balance to call transfer/mint
// - Token balances are tracked in the "balances" mapping
// - Decimals: 8 (1 MTK = 100,000,000 raw units)
//
// DEPLOYMENT:
// - Costs ~1 MVM in gas to deploy (CreateToken tx)
// - Total supply is minted to the deployer
//
// FUNCTIONS:
// - transfer(to, amount) - Send tokens to another address
// - balanceOf(account)   - Check token balance (view, no gas)
// - mint(to, amount)     - Create new tokens (owner only)
// - burn(amount)         - Destroy your own tokens
// ============================================

forge SimpleToken {
    // Token metadata
    let name: string = "MyToken";
    let symbol: string = "MTK";
    let totalSupply: u256 = 1000000;
    let decimals: u8 = 8;

    // Balances mapping
    map balances: address => u256;

    // Allowances: owner => spender => amount
    map allowances: address => u256;

    // Transfer tokens from sender to recipient
    // Requires: sender has enough balance
    // Gas cost: ~65,000 gas (paid in MVM)
    fn transfer(to: address, amount: u256) mut {
        guard(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        signal Transfer(msg.sender, to, amount);
    }

    // Get token balance of an account
    // This is a view function - no gas cost
    fn balanceOf(account: address) pub -> u256 {
        return balances[account];
    }

    // Mint new tokens (owner only)
    // Increases total supply
    fn mint(to: address, amount: u256) mut seal {
        balances[to] += amount;
        totalSupply += amount;
        signal Mint(to, amount);
    }

    // Burn tokens from sender balance
    // Decreases total supply permanently
    fn burn(amount: u256) mut {
        guard(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        signal Burn(msg.sender, amount);
    }
}`,

  vault: `forge StakingVault {
    // State
    let totalStaked: u256 = 0;
    let rewardRate: u256 = 100;

    // Mappings
    map stakes: address => u256;

    // Stake MVM tokens
    fn stake() vault {
        guard(msg.value > 0, "Must send tokens");
        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;
        signal Staked(msg.sender, msg.value);
    }

    // Unstake MVM tokens
    fn unstake(amount: u256) mut {
        guard(stakes[msg.sender] >= amount, "Insufficient stake");
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        transfer(msg.sender, amount);
        signal Unstaked(msg.sender, amount);
    }

    // Get stake balance
    fn getStake(account: address) pub -> u256 {
        return stakes[account];
    }

    // Get total staked
    fn getTotalStaked() pub -> u256 {
        return totalStaked;
    }
}`,

  empty: `forge MyContract {
    // Variables
    let value: u256 = 0;

    // Set value
    fn setValue(newValue: u256) mut {
        value = newValue;
    }

    // Get value
    fn getValue() pub -> u256 {
        return value;
    }
}`,

  lottery: `forge Lottery {
    // State
    let ticketPrice: u256 = 100;
    let totalPool: u256 = 0;
    let ticketCount: u256 = 0;
    let isOpen: bool = true;

    // Mappings
    map tickets: address => u256;

    // Buy lottery ticket
    fn buyTicket() vault {
        guard(msg.value >= ticketPrice, "Not enough for ticket");
        guard(isOpen == true, "Lottery is closed");
        tickets[msg.sender] += 1;
        ticketCount += 1;
        totalPool += msg.value;
        signal TicketPurchased(msg.sender, ticketCount);
    }

    // Close lottery (owner only)
    fn closeLottery() mut seal {
        isOpen = false;
        signal LotteryClosed(totalPool);
    }

    // Award winner (owner only)
    fn awardWinner(winner: address) mut seal {
        guard(isOpen == false, "Lottery still open");
        if (totalPool > 0) {
            transfer(winner, totalPool);
            signal WinnerAwarded(winner, totalPool);
        } else {
            signal NoWinner(ticketCount);
        }
        totalPool = 0;
        ticketCount = 0;
        isOpen = true;
    }
}`,

  calculator: `forge Calculator {
    // State
    let result: u256 = 0;
    let lastOp: string = "none";

    // Set initial value
    fn set(val: u256) mut {
        result = val;
        lastOp = "set";
        signal Calculate("set", val);
    }

    // Add to result
    fn add(val: u256) mut {
        result += val;
        lastOp = "add";
        signal Calculate("add", val);
    }

    // Subtract from result
    fn subtract(val: u256) mut {
        guard(result >= val, "Would underflow");
        result -= val;
        lastOp = "sub";
    }

    // Multiply result
    fn multiply(val: u256) mut {
        result *= val;
        lastOp = "mul";
    }

    // Divide result
    fn divide(val: u256) mut {
        guard(val > 0, "Cannot divide by zero");
        result /= val;
        lastOp = "div";
    }

    // Modulo result
    fn modulo(val: u256) mut {
        guard(val > 0, "Cannot mod by zero");
        result %= val;
        lastOp = "mod";
    }

    // Conditional: double if above threshold
    fn doubleIfAbove(threshold: u256) mut {
        if (result > threshold) {
            result *= 2;
            signal Doubled(result);
        } else {
            signal BelowThreshold(result, threshold);
        }
    }

    // Get result
    fn getResult() pub -> u256 {
        return result;
    }
}`
}
