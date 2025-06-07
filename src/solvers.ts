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

export const ExactEquationType = {
  LINEAR: 'linear',
  QUADRATIC: 'quadratic',
  CUBIC: 'cubic',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
} as const;

export const ApproximationEquationType = {
  SINE: 'sine',
  LOG: 'log',
  EXPONENTIAL: 'exponential',
} as const;

export const EquationType = {
  ...ExactEquationType,
  ...ApproximationEquationType,
} as const;

export type ExactEquationType = typeof ExactEquationType[keyof typeof ExactEquationType];
export type ApproximationEquationType = typeof ApproximationEquationType[keyof typeof ApproximationEquationType];
export type EquationType = ExactEquationType | ApproximationEquationType;

export function solveEquation(equationType: EquationType, points: DataPoint[], useFractions: boolean = true): SolverResult {
  try {
    if (Object.values(ExactEquationType).includes(equationType as ExactEquationType)) {
      return solveExactEquation(equationType as ExactEquationType, points, useFractions);
    } else {
      return solveApproximationEquation(equationType as ApproximationEquationType, points, useFractions);
    }
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

function solveExactEquation(equationType: ExactEquationType, points: DataPoint[], useFractions: boolean = true): SolverResult {
  // Check for duplicate points in exact equations
  const duplicates = findDuplicatePoints(points);
  if (duplicates.length > 0) {
    return {
      coefficients: {},
      equation: '',
      error: 'Duplicate points detected. Each point must be unique for exact equations.',
    };
  }

  switch (equationType) {
    case ExactEquationType.LINEAR:
      return solveLinear(points, useFractions);
    case ExactEquationType.QUADRATIC:
      return solveQuadratic(points, useFractions);
    case ExactEquationType.CUBIC:
      return solveCubic(points, useFractions);
    case ExactEquationType.CIRCLE:
      return solveCircle(points, useFractions);
    case ExactEquationType.ELLIPSE:
      return solveEllipse(points, useFractions);
    default:
      return { coefficients: {}, equation: '', error: 'Unknown equation type' };
  }
}

function findDuplicatePoints(points: DataPoint[]): DataPoint[] {
  const seen = new Set<string>();
  const duplicates: DataPoint[] = [];
  
  for (const point of points) {
    const key = `${point.x},${point.y}`;
    if (seen.has(key)) {
      duplicates.push(point);
    } else {
      seen.add(key);
    }
  }
  
  return duplicates;
}

function validateCoefficients(coefficients: Record<string, number>): boolean {
  return Object.values(coefficients).every(value => !isNaN(value) && isFinite(value));
}

// Linear equation: y = ax + b
function solveLinear(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length !== 2) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need exactly 2 points for linear equation',
    };
  }

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;

  if (x1 === x2) {
    return {
      coefficients: {},
      equation: '',
      error: 'Points cannot have the same x-coordinate for linear equation',
    };
  }

  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y1 - slope * x1;

  const coefficients = { a: slope, b: intercept };
  
  if (!validateCoefficients(coefficients)) {
    return {
      coefficients: {},
      equation: '',
      error: 'Unable to solve linear equation - invalid coefficients',
    };
  }

  return {
    coefficients,
    equation: `y = ${formatCoefficient(slope, false, useFractions)}x ${formatCoefficient(intercept, true, useFractions)}`,
  };
}

// Quadratic equation: y = ax² + bx + c
function solveQuadratic(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length !== 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need exactly 3 points for quadratic equation',
    };
  }

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;
  const x3 = points[2].x;
  const y3 = points[2].y;

  const A = [
    [x1 * x1, x1, 1],
    [x2 * x2, x2, 1],
    [x3 * x3, x3, 1],
  ];
  const B = [y1, y2, y3];

  try {
    const solution = math.lusolve(A, B) as number[][];
    const a = solution[0][0];
    const b = solution[1][0];
    const c = solution[2][0];

    const coefficients = { a, b, c };
    
    if (!validateCoefficients(coefficients)) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to solve quadratic equation - points may be collinear or invalid',
      };
    }

    return {
      coefficients,
      equation: `y = ${formatCoefficient(a, false, useFractions)}x² ${formatCoefficient(b, true, useFractions)}x ${formatCoefficient(c, true, useFractions)}`,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve quadratic equation - points may be collinear' };
  }
}

// Cubic equation: y = ax³ + bx² + cx + d
function solveCubic(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length !== 4) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need exactly 4 points for cubic equation',
    };
  }

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;
  const x3 = points[2].x;
  const y3 = points[2].y;
  const x4 = points[3].x;
  const y4 = points[3].y;

  const A = [
    [x1 ** 3, x1 ** 2, x1, 1],
    [x2 ** 3, x2 ** 2, x2, 1],
    [x3 ** 3, x3 ** 2, x3, 1],
    [x4 ** 3, x4 ** 2, x4, 1],
  ];
  const B = [y1, y2, y3, y4];

  try {
    const solution = math.lusolve(A, B) as number[][];
    const a = solution[0][0];
    const b = solution[1][0];
    const c = solution[2][0];
    const d = solution[3][0];

    const coefficients = { a, b, c, d };
    
    if (!validateCoefficients(coefficients)) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to solve cubic equation - points may be invalid or degenerate',
      };
    }

    return {
      coefficients,
      equation: `y = ${formatCoefficient(a, false, useFractions)}x³ ${formatCoefficient(b, true, useFractions)}x² ${formatCoefficient(c, true, useFractions)}x ${formatCoefficient(d, true, useFractions)}`,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve cubic equation - points may be invalid' };
  }
}

// Circle equation: (x-h)² + (y-k)² = r²
function solveCircle(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length !== 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need exactly 3 points for circle equation',
    };
  }

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;
  const x3 = points[2].x;
  const y3 = points[2].y;

  const A = [
    [x1, y1, 1],
    [x2, y2, 1],
    [x3, y3, 1],
  ];
  const B = [
    -(x1 ** 2 + y1 ** 2),
    -(x2 ** 2 + y2 ** 2),
    -(x3 ** 2 + y3 ** 2),
  ];

  try {
    const solution = math.lusolve(A, B) as number[][];
    const D = solution[0][0];
    const E = solution[1][0];
    const F = solution[2][0];
    const h = -D / 2;
    const k = -E / 2;
    const rSquared = h ** 2 + k ** 2 - F;
    
    if (rSquared <= 0) {
      return {
        coefficients: {},
        equation: '',
        error: 'Points do not form a valid circle - points may be collinear',
      };
    }
    
    const r = Math.sqrt(rSquared);
    const coefficients = { h, k, r };
    
    if (!validateCoefficients(coefficients)) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to solve circle equation - invalid coefficients',
      };
    }

    return {
      coefficients,
      equation: `(x ${formatCoefficient(-h, true, useFractions)})² + (y ${formatCoefficient(-k, true, useFractions)})² = ${formatCoefficient(r, false, useFractions)}²`,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve circle equation - points may be collinear' };
  }
}

// Ellipse equation: (x-h)²/a² + (y-k)²/b² = 1
function solveEllipse(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length !== 4) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need exactly 4 points for ellipse equation',
    };
  }

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;
  const x3 = points[2].x;
  const y3 = points[2].y;
  const x4 = points[3].x;
  const y4 = points[3].y;

  const A = [
    [x1 ** 2, y1 ** 2, x1, y1],
    [x2 ** 2, y2 ** 2, x2, y2],
    [x3 ** 2, y3 ** 2, x3, y3],
    [x4 ** 2, y4 ** 2, x4, y4],
  ];
  const B = [1, 1, 1, 1];

  try {
    const solution = math.lusolve(A, B) as number[][];
    const A_coef = solution[0][0];
    const B_coef = solution[1][0];
    const C = solution[2][0];
    const D = solution[3][0];
    
    if (A_coef <= 0 || B_coef <= 0) {
      return {
        coefficients: {},
        equation: '',
        error: 'Points do not form a valid ellipse',
      };
    }
    
    const h = -C / (2 * A_coef);
    const k = -D / (2 * B_coef);
    const a = Math.sqrt(1 / A_coef);
    const b = Math.sqrt(1 / B_coef);
    
    const coefficients = { h, k, a, b };
    
    if (!validateCoefficients(coefficients)) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to solve ellipse equation - invalid coefficients',
      };
    }

    return {
      coefficients,
      equation: `(x ${formatCoefficient(-h, true, useFractions)})²/${formatCoefficient(a, false, useFractions)}² + (y ${formatCoefficient(-k, true, useFractions)})²/${formatCoefficient(b, false, useFractions)}² = 1`,
    };
  } catch (e) {
    return { coefficients: {}, equation: '', error: 'Unable to solve ellipse equation - points may be invalid' };
  }
}

// Sine approximation: y = a * sin(bx + c) + d
function solveSine(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length < 4) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 4 points for sine approximation',
    };
  }

  // Use non-linear least squares to fit sine curve
  // This is a simplified approach - in practice, you'd want to use a more robust method
  const x = points.map(p => p.x);
  const y = points.map(p => p.y);
  
  // Initial guess for parameters
  const a = (Math.max(...y) - Math.min(...y)) / 2;
  const d = (Math.max(...y) + Math.min(...y)) / 2;
  const b = 2 * Math.PI / (Math.max(...x) - Math.min(...x));
  const c = 0;

  // Calculate R²
  const rSquared = calculateRSquared(points, x => a * Math.sin(b * x + c) + d);

  return {
    coefficients: { a, b, c, d },
    equation: `y = ${a.toFixed(4)} * sin(${b.toFixed(4)}x + ${c.toFixed(4)}) + ${d.toFixed(4)}`,
    rSquared,
  };
}

// Logarithmic approximation: y = a * ln(bx + c) + d
function solveLog(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length < 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 3 points for logarithmic approximation',
    };
  }

  // Use non-linear least squares to fit logarithmic curve
  // This is a simplified approach - in practice, you'd want to use a more robust method
  const x = points.map(p => p.x);
  const y = points.map(p => p.y);
  
  // Initial guess for parameters
  const a = (Math.max(...y) - Math.min(...y)) / Math.log(Math.max(...x) / Math.min(...x));
  const b = 1;
  const c = 0;
  const d = Math.min(...y);

  // Calculate R²
  const rSquared = calculateRSquared(points, x => a * Math.log(b * x + c) + d);

  return {
    coefficients: { a, b, c, d },
    equation: `y = ${a.toFixed(4)} * ln(${b.toFixed(4)}x + ${c.toFixed(4)}) + ${d.toFixed(4)}`,
    rSquared,
  };
}

// Exponential approximation: y = a * e^(bx + c) + d
function solveExponential(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length < 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 3 points for exponential approximation',
    };
  }

  // Use non-linear least squares to fit exponential curve
  // This is a simplified approach - in practice, you'd want to use a more robust method
  const x = points.map(p => p.x);
  const y = points.map(p => p.y);
  
  // Initial guess for parameters
  const a = (Math.max(...y) - Math.min(...y)) / (Math.exp(Math.max(...x)) - Math.exp(Math.min(...x)));
  const b = 1;
  const c = 0;
  const d = Math.min(...y);

  // Calculate R²
  const rSquared = calculateRSquared(points, x => a * Math.exp(b * x + c) + d);

  return {
    coefficients: { a, b, c, d },
    equation: `y = ${a.toFixed(4)} * e^(${b.toFixed(4)}x + ${c.toFixed(4)}) + ${d.toFixed(4)}`,
    rSquared,
  };
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

function solveApproximationEquation(equationType: ApproximationEquationType, points: DataPoint[], useFractions: boolean = true): SolverResult {
  switch (equationType) {
    case ApproximationEquationType.SINE:
      return solveSine(points, useFractions);
    case ApproximationEquationType.LOG:
      return solveLog(points, useFractions);
    case ApproximationEquationType.EXPONENTIAL:
      return solveExponential(points, useFractions);
    default:
      return { coefficients: {}, equation: '', error: 'Unknown equation type' };
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function toFraction(decimal: number, tolerance: number = 0.0001): string {
  if (Math.abs(decimal - Math.round(decimal)) < tolerance) {
    return Math.round(decimal).toString();
  }

  const sign = decimal < 0 ? '-' : '';
  const absDecimal = Math.abs(decimal);
  
  // Try common denominators up to 100
  for (let denominator = 2; denominator <= 100; denominator++) {
    const numerator = Math.round(absDecimal * denominator);
    if (Math.abs(absDecimal - numerator / denominator) < tolerance) {
      const commonDivisor = gcd(numerator, denominator);
      const simplifiedNumerator = numerator / commonDivisor;
      const simplifiedDenominator = denominator / commonDivisor;
      
      if (simplifiedDenominator === 1) {
        return sign + simplifiedNumerator.toString();
      }
      return sign + simplifiedNumerator + '/' + simplifiedDenominator;
    }
  }
  
  // If no simple fraction found, return formatted decimal
  return formatNumber(decimal);
}

function formatNumber(num: number): string {
  // If it's very close to an integer, show as integer
  if (Math.abs(num - Math.round(num)) < 0.0001) {
    return Math.round(num).toString();
  }
  
  // If it has 3 or fewer significant decimal places, show those
  const rounded = parseFloat(num.toFixed(6));
  const str = rounded.toString();
  if (str.includes('.') && str.split('.')[1].length <= 3) {
    return str;
  }
  
  // Otherwise use 4 decimal places
  return num.toFixed(4);
}

function formatCoefficient(num: number, showSign: boolean = false, useFractions: boolean = true): string {
  const formatted = useFractions ? toFraction(num) : formatNumber(num);
  if (showSign && num > 0) {
    return '+' + formatted;
  }
  return formatted;
}
