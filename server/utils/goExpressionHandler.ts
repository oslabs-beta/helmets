// import required expression handler utilities
import valuesHandler from './handlers/valuesHandler';

// declare object literal expressionMap, mapping IDs to objects with 1) conditional check method, 2) corresponding imported expression handler utility

// create ts interface for goExpressionMap
interface GoExpressionPointer {
  condition: (expression: string) => boolean;
  handler: (expression: string) => string;
}

const goExpressionMap: GoExpressionPointer[] = [
  {
    condition: (expression: string) => expression.includes('go'),
    handler: valuesHandler
  }
]