/**
 * Syntax Error Detection and Analysis
 * Detects syntax errors in code, text, and other content types
 */

export interface SyntaxError {
  line: number;
  column?: number;
  message: string;
  type: "error" | "warning";
  code?: string;
}

export interface SyntaxAnalysisResult {
  hasErrors: boolean;
  errors: SyntaxError[];
  totalLines: number;
  affectedLines: number;
  language?: string;
}

/**
 * Detect the programming language from content
 */
function detectLanguage(content: string): string {
  // Look for common language indicators
  if (
    content.includes("function") ||
    content.includes("const ") ||
    content.includes("let ")
  ) {
    if (content.includes("=>") || content.includes("function")) {
      return "javascript";
    }
  }
  if (content.includes("def ") || content.includes("class ")) {
    return "python";
  }
  if (content.includes("public class") || content.includes("private ")) {
    return "java";
  }
  if (content.includes("<?php") || content.includes("$")) {
    return "php";
  }
  if (content.includes("#include") || content.includes("cout")) {
    return "cpp";
  }
  if (content.includes("package ") || content.includes("func ")) {
    return "go";
  }
  if (content.includes("fn ") || content.includes("let ")) {
    return "rust";
  }
  if (content.includes("def ") || content.includes("if __name__")) {
    return "python";
  }
  return "unknown";
}

/**
 * Check for common JavaScript/TypeScript syntax errors
 */
function checkJavaScriptSyntax(content: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for unclosed brackets
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        line: lineNum,
        message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
        type: "error",
        code: "BRACE_MISMATCH",
      });
    }

    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        line: lineNum,
        message: `Mismatched parentheses: ${openParens} opening, ${closeParens} closing`,
        type: "error",
        code: "PAREN_MISMATCH",
      });
    }

    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        line: lineNum,
        message: `Mismatched brackets: ${openBrackets} opening, ${closeBrackets} closing`,
        type: "error",
        code: "BRACKET_MISMATCH",
      });
    }

    // Check for missing semicolons (warning)
    if (
      line.trim() &&
      !line.trim().endsWith(";") &&
      !line.trim().endsWith("{") &&
      !line.trim().endsWith("}") &&
      !line.trim().endsWith(",") &&
      !line.trim().startsWith("//") &&
      !line.trim().endsWith("=>") &&
      !line.includes("if") &&
      !line.includes("for") &&
      !line.includes("while") &&
      !line.includes("else") &&
      !line.includes("function") &&
      !line.includes("class")
    ) {
      // This is just a warning, not a hard error
    }

    // Check for common syntax issues
    if (
      line.includes("const ") &&
      line.includes("=") &&
      !line.includes(";") &&
      !line.trim().endsWith("}") &&
      !line.includes("=>")
    ) {
      errors.push({
        line: lineNum,
        message: "Missing semicolon after const declaration",
        type: "warning",
        code: "MISSING_SEMICOLON",
      });
    }

    // Check for incomplete quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    const backticks = (line.match(/`/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        message: "Unmatched single quotes",
        type: "error",
        code: "UNMATCHED_QUOTE",
      });
    }

    if (doubleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        message: "Unmatched double quotes",
        type: "error",
        code: "UNMATCHED_QUOTE",
      });
    }

    if (backticks % 2 !== 0) {
      errors.push({
        line: lineNum,
        message: "Unmatched backticks",
        type: "error",
        code: "UNMATCHED_BACKTICK",
      });
    }
  });

  return errors;
}

/**
 * Check for Python syntax errors
 */
function checkPythonSyntax(content: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for indentation issues
    const leadingSpaces = line.match(/^ */)?.[0].length || 0;
    if (leadingSpaces % 2 !== 0 && leadingSpaces % 4 !== 0 && line.trim()) {
      errors.push({
        line: lineNum,
        message: "Unusual indentation (not multiple of 2 or 4)",
        type: "warning",
        code: "INDENT_ERROR",
      });
    }

    // Check for unclosed brackets
    const openParen = (line.match(/\(/g) || []).length;
    const closeParen = (line.match(/\)/g) || []).length;
    if (openParen !== closeParen) {
      errors.push({
        line: lineNum,
        message: `Mismatched parentheses`,
        type: "error",
        code: "PAREN_MISMATCH",
      });
    }

    const openBracket = (line.match(/\[/g) || []).length;
    const closeBracket = (line.match(/\]/g) || []).length;
    if (openBracket !== closeBracket) {
      errors.push({
        line: lineNum,
        message: `Mismatched brackets`,
        type: "error",
        code: "BRACKET_MISMATCH",
      });
    }

    // Check for missing colons after control structures
    if (
      (line.trim().startsWith("if ") ||
        line.trim().startsWith("for ") ||
        line.trim().startsWith("while ") ||
        line.trim().startsWith("def ") ||
        line.trim().startsWith("class ")) &&
      !line.includes(":")
    ) {
      errors.push({
        line: lineNum,
        message: "Missing colon after control structure",
        type: "error",
        code: "MISSING_COLON",
      });
    }

    // Check for unmatched quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        message: "Unmatched single quotes",
        type: "error",
        code: "UNMATCHED_QUOTE",
      });
    }

    if (doubleQuotes % 2 !== 0) {
      errors.push({
        line: lineNum,
        message: "Unmatched double quotes",
        type: "error",
        code: "UNMATCHED_QUOTE",
      });
    }
  });

  return errors;
}

/**
 * Main syntax checking function
 */
export function analyzeSyntax(content: string): SyntaxAnalysisResult {
  if (!content || !content.trim()) {
    return {
      hasErrors: false,
      errors: [],
      totalLines: 0,
      affectedLines: 0,
    };
  }

  const lines = content.split("\n");
  const totalLines = lines.length;
  const language = detectLanguage(content);

  let errors: SyntaxError[] = [];

  // Choose appropriate checker based on language detection
  if (
    language === "javascript" ||
    language === "typescript" ||
    language === "unknown"
  ) {
    errors = checkJavaScriptSyntax(content);
  } else if (language === "python") {
    errors = checkPythonSyntax(content);
  }

  // Deduplicate errors on same line with same message
  const uniqueErrors = Array.from(
    new Map(errors.map((e) => [`${e.line}-${e.message}`, e])).values(),
  );

  const affectedLines = new Set(uniqueErrors.map((e) => e.line)).size;

  return {
    hasErrors: uniqueErrors.length > 0,
    errors: uniqueErrors,
    totalLines,
    affectedLines,
    language,
  };
}

/**
 * Get a summary of syntax issues
 */
export function getSyntaxSummary(result: SyntaxAnalysisResult): string {
  if (!result.hasErrors) {
    return `✓ No syntax errors detected (${result.totalLines} lines)`;
  }

  const errorCount = result.errors.filter((e) => e.type === "error").length;
  const warningCount = result.errors.filter((e) => e.type === "warning").length;

  let summary = `Found ${result.errors.length} issue(s) on ${result.affectedLines} line(s)`;

  if (errorCount > 0) {
    summary += ` (${errorCount} error${errorCount !== 1 ? "s" : ""})`;
  }
  if (warningCount > 0) {
    summary += ` (${warningCount} warning${warningCount !== 1 ? "s" : ""})`;
  }

  return summary;
}
