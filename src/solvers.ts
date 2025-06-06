import * as math from 'mathjs';

export interface DataPoint {
  x: number;
  y: number;
}

export interface SolverResult {
  coefficients: Record<string, number>;
  equation: string;
  error?: string;
  rSquared?: number;
}

export type EquationType = 'linear' | 'quadratic' | 'cubic' | 'circle' | 'ellipse';

export function solveEquation(equationType: EquationType, points: DataPoint[]): SolverResult {
  try {
    switch (equationType) {
      case 'linear':
        return solveLinear(points);
      case 'quadratic':
        return solveQuadratic(points);
      case 'cubic':
        return solveCubic(points);
      case 'circle':
        return solveCircle(points);
      case 'ellipse':
        return solveEllipse(points);

      default:
        return { coefficients: {}, equation: '', error: 'Unknown equation type' };
    }
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

// Linear equation: y = ax + b
function solveLinear(points: DataPoint[]): SolverResult {
  if (points.length < 2) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 2 points for linear regression',
    };
  }

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const rSquared = calculateRSquared(points, x => slope * x + intercept);

  return {
    coefficients: { a: slope, b: intercept },
    equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
    rSquared,
  };
}

// Quadratic equation: y = ax² + bx + c
function solveQuadratic(points: DataPoint[]): SolverResult {
  if (points.length < 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 3 points for quadratic regression',
    };
  }

  const A = points.map(p => [p.x * p.x, p.x, 1]);
  const B = points.map(p => p.y);

  try {
    const solution = math.lusolve(A, B) as number[][];
    const a = solution[0][0];
    const b = solution[1][0];
    const c = solution[2][0];

    const rSquared = calculateRSquared(points, x => a * x * x + b * x + c);

    return {
      coefficients: { a, b, c },
      equation: `y = ${a.toFixed(4)}x² + ${b.toFixed(4)}x + ${c.toFixed(4)}`,
      rSquared,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve quadratic equation' };
  }
}

// Cubic equation: y = ax³ + bx² + cx + d
function solveCubic(points: DataPoint[]): SolverResult {
  if (points.length < 4) {
    return { coefficients: {}, equation: '', error: 'Need at least 4 points for cubic regression' };
  }

  const A = points.map(p => [p.x ** 3, p.x ** 2, p.x, 1]);
  const B = points.map(p => p.y);

  try {
    const solution = math.lusolve(A, B) as number[][];
    const a = solution[0][0];
    const b = solution[1][0];
    const c = solution[2][0];
    const d = solution[3][0];

    const rSquared = calculateRSquared(points, x => a * x ** 3 + b * x * x + c * x + d);

    return {
      coefficients: { a, b, c, d },
      equation: `y = ${a.toFixed(4)}x³ + ${b.toFixed(4)}x² + ${c.toFixed(4)}x + ${d.toFixed(4)}`,
      rSquared,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve cubic equation' };
  }
}

// Circle equation: (x-h)² + (y-k)² = r²
function solveCircle(points: DataPoint[]): SolverResult {
  if (points.length < 3) {
    return { coefficients: {}, equation: '', error: 'Need at least 3 points for circle equation' };
  }

  // Convert to general form: x² + y² + Dx + Ey + F = 0
  const A = points.map(p => [p.x, p.y, 1]);
  const B = points.map(p => -(p.x ** 2 + p.y ** 2));

  try {
    const solution = math.lusolve(A, B) as number[][];
    const D = solution[0][0];
    const E = solution[1][0];
    const F = solution[2][0];

    const h = -D / 2;
    const k = -E / 2;
    const r = Math.sqrt(h ** 2 + k ** 2 - F);

    if (r <= 0 || !isFinite(r)) {
      return { coefficients: {}, equation: '', error: 'Invalid circle parameters' };
    }

    return {
      coefficients: { h, k, r },
      equation: `(x - ${h.toFixed(4)})² + (y - ${k.toFixed(4)})² = ${r.toFixed(4)}²`,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve circle equation' };
  }
}

// Ellipse equation: (x-h)²/a² + (y-k)²/b² = 1
function solveEllipse(points: DataPoint[]): SolverResult {
  if (points.length < 5) {
    return { coefficients: {}, equation: '', error: 'Need at least 5 points for ellipse equation' };
  }

  try {
    // This is a simplified approach - in practice, ellipse fitting is complex
    // For demo purposes, we'll use a simpler axis-aligned approach
    return solveAxisAlignedEllipse(points);
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve ellipse equation' };
  }
}

// Simplified axis-aligned ellipse
function solveAxisAlignedEllipse(points: DataPoint[]): SolverResult {
  if (points.length < 4) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 4 points for axis-aligned ellipse',
    };
  }

  try {
    // Estimate center as centroid
    const h = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const k = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Estimate semi-axes
    const a = Math.sqrt(points.reduce((sum, p) => sum + (p.x - h) ** 2, 0) / points.length);
    const b = Math.sqrt(points.reduce((sum, p) => sum + (p.y - k) ** 2, 0) / points.length);

    return {
      coefficients: { h, k, a, b },
      equation: `(x - ${h.toFixed(4)})²/${a.toFixed(4)}² + (y - ${k.toFixed(4)})²/${b.toFixed(4)}² = 1`,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve ellipse equation' };
  }
}

function calculateRSquared(points: DataPoint[], predictFn: (x: number) => number): number {
  const yMean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const ssRes = points.reduce((sum, p) => {
    const predicted = predictFn(p.x);
    return sum + (p.y - predicted) ** 2;
  }, 0);
  const ssTot = points.reduce((sum, p) => sum + (p.y - yMean) ** 2, 0);
  return 1 - ssRes / ssTot;
}
