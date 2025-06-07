import * as math from 'mathjs';
import { levenbergMarquardt } from 'ml-levenberg-marquardt';

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

export type ExactEquationType = (typeof ExactEquationType)[keyof typeof ExactEquationType];
export type ApproximationEquationType =
  (typeof ApproximationEquationType)[keyof typeof ApproximationEquationType];
export type EquationType = ExactEquationType | ApproximationEquationType;

export function solveEquation(
  equationType: EquationType,
  points: DataPoint[],
  useFractions: boolean = true
): SolverResult {
  try {
    if (Object.values(ExactEquationType).includes(equationType as ExactEquationType)) {
      return solveExactEquation(equationType as ExactEquationType, points, useFractions);
    } else {
      return solveApproximationEquation(
        equationType as ApproximationEquationType,
        points,
        useFractions
      );
    }
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

function solveExactEquation(
  equationType: ExactEquationType,
  points: DataPoint[],
  useFractions: boolean = true
): SolverResult {
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

function solvePolynomial(
  points: DataPoint[],
  degree: number,
  useFractions: boolean = true
): SolverResult {
  const requiredPoints = degree + 1;

  if (points.length !== requiredPoints) {
    const equationType = degree === 1 ? 'linear' : degree === 2 ? 'quadratic' : 'cubic';
    return {
      coefficients: {},
      equation: '',
      error: `Need exactly ${requiredPoints} points for ${equationType} equation`,
    };
  }

  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const { x, y } = points[i];
    const row: number[] = [];

    for (let j = degree; j >= 0; j--) {
      row.push(x ** j);
    }

    A.push(row);
    B.push(y);
  }

  try {
    const solution = math.lusolve(A, B) as number[][];
    const coefficients: Record<string, number> = {};
    const terms: Array<{ coef: number; term: string }> = [];

    for (let i = 0; i <= degree; i++) {
      const coef = solution[i][0];
      const power = degree - i;

      const coeffName = String.fromCharCode(97 + i); // 'a', 'b', 'c', 'd'
      coefficients[coeffName] = coef;

      let term = '';
      if (power === 0) {
        term = ''; // constant term
      } else if (power === 1) {
        term = 'x';
      } else if (power === 2) {
        term = 'x²';
      } else if (power === 3) {
        term = 'x³';
      }

      terms.push({ coef, term });
    }

    if (!validateCoefficients(coefficients)) {
      const equationType = degree === 1 ? 'linear' : degree === 2 ? 'quadratic' : 'cubic';
      return {
        coefficients: {},
        equation: '',
        error: `Unable to solve ${equationType} equation - points may be collinear or invalid`,
      };
    }

    return {
      coefficients,
      equation: buildPolynomialEquation(terms, useFractions),
    };
  } catch (e) {
    const equationType = degree === 1 ? 'linear' : degree === 2 ? 'quadratic' : 'cubic';
    return {
      coefficients: {},
      equation: '',
      error: `Unable to solve ${equationType} equation - points may be collinear or invalid`,
    };
  }
}

// Linear equation: y = ax + b
function solveLinear(points: DataPoint[], useFractions: boolean = true): SolverResult {
  return solvePolynomial(points, 1, useFractions);
}

// Quadratic equation: y = ax² + bx + c
function solveQuadratic(points: DataPoint[], useFractions: boolean = true): SolverResult {
  return solvePolynomial(points, 2, useFractions);
}

// Cubic equation: y = ax³ + bx² + cx + d
function solveCubic(points: DataPoint[], useFractions: boolean = true): SolverResult {
  return solvePolynomial(points, 3, useFractions);
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
  const B = [-(x1 ** 2 + y1 ** 2), -(x2 ** 2 + y2 ** 2), -(x3 ** 2 + y3 ** 2)];

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

    let equation = '(x';
    if (Math.abs(h) > 1e-10) {
      const hFormatted = formatCoefficient(-h, true, useFractions);
      if (hFormatted !== '') {
        equation += hFormatted;
      }
    }
    equation += ')² + (y';
    if (Math.abs(k) > 1e-10) {
      const kFormatted = formatCoefficient(-k, true, useFractions);
      if (kFormatted !== '') {
        equation += kFormatted;
      }
    }
    equation += ')² = ';
    equation += formatCoefficient(r, false, useFractions) + '²';

    return {
      coefficients,
      equation,
    };
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: 'Unable to solve circle equation - points may be collinear',
    };
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

    const constantTerm = 1 + (C * C) / (4 * A_coef) + (D * D) / (4 * B_coef);

    if (constantTerm <= 0) {
      return {
        coefficients: {},
        equation: '',
        error: 'Points do not form a valid ellipse - negative discriminant',
      };
    }

    const a = Math.sqrt(constantTerm / A_coef);
    const b = Math.sqrt(constantTerm / B_coef);

    const coefficients = { h, k, a, b };

    if (!validateCoefficients(coefficients)) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to solve ellipse equation - invalid coefficients',
      };
    }

    let equation = '(x';
    if (Math.abs(h) > 1e-10) {
      const hFormatted = formatCoefficient(-h, true, useFractions);
      if (hFormatted !== '') {
        equation += hFormatted;
      }
    }
    equation += ')²/';
    equation += formatCoefficient(a, false, useFractions) + '²';
    equation += ' + (y';
    if (Math.abs(k) > 1e-10) {
      const kFormatted = formatCoefficient(-k, true, useFractions);
      if (kFormatted !== '') {
        equation += kFormatted;
      }
    }
    equation += ')²/';
    equation += formatCoefficient(b, false, useFractions) + '²';
    equation += ' = 1';

    return {
      coefficients,
      equation,
    };
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: 'Unable to solve ellipse equation - points may be invalid',
    };
  }
}

// Sine approximation: y = a * sin(bx + c) + d using Levenberg-Marquardt
function solveSine(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length < 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 3 points for sine approximation',
    };
  }

  try {
    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    
    // Smart initial parameter estimation
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    const yRange = Math.max(...y) - Math.min(...y);
    const xRange = Math.max(...x) - Math.min(...x);
    
    // Estimate offset (d) as mean of y values
    const d_init = yMean;
    
    // Estimate amplitude (a) as half the range
    const a_init = yRange / 2;
    
    // Estimate frequency (b) using FFT-like approach or autocorrelation
    let b_init = 2 * Math.PI / (xRange * 0.5); // Assume 2 cycles in data range
    
    // Sophisticated phase estimation using least squares
    let c_init = 0;
    let bestError = Infinity;
    
    // Test multiple phase values to find best initial guess
    for (let phase = 0; phase < 2 * Math.PI; phase += Math.PI / 16) {
      let error = 0;
      for (let i = 0; i < points.length; i++) {
        const predicted = a_init * Math.sin(b_init * x[i] + phase) + d_init;
        error += (y[i] - predicted) ** 2;
      }
      if (error < bestError) {
        bestError = error;
        c_init = phase;
      }
    }
    
    // Define the sine function for Levenberg-Marquardt
    function sineFunction([a, b, c, d]: number[]) {
      return (xi: number) => a * Math.sin(b * xi + c) + d;
    }
    
    // Smart initialization strategies optimized for <2 seconds
    const initialGuesses: number[][] = [];
    
    // Primary estimates from data analysis
    initialGuesses.push([a_init, b_init, c_init, d_init]);
    
    // Most important variations first (highest impact)
    // Amplitude variations
    for (const factor of [0.5, 1.2, 1.5, 2.0]) {
      initialGuesses.push([a_init * factor, b_init, c_init, d_init]);
    }
    
    // Frequency variations (harmonics)
    for (const freqFactor of [0.5, 1.5, 2.0, 3.0]) {
      initialGuesses.push([a_init, b_init * freqFactor, c_init, d_init]);
    }
    
    // Key phase shifts (every π/4 radians for speed)
    for (let phase = 0; phase < 2 * Math.PI; phase += Math.PI / 4) {
      initialGuesses.push([a_init, b_init, phase, d_init]);
    }
    
    // Opposite phase attempts (critical for sine waves)
    initialGuesses.push([-a_init, b_init, c_init + Math.PI, d_init]);
    initialGuesses.push([-a_init * 1.2, b_init, c_init + Math.PI, d_init]);
    
    // Offset variations
    const yMeanAlt = (Math.max(...y) + Math.min(...y)) / 2;
    initialGuesses.push([a_init, b_init, c_init, yMeanAlt]);
    initialGuesses.push([a_init, b_init, c_init, 0]);
    
    let bestResult: any = null;
    let bestR2 = -Infinity;
    const startTime = Date.now();
    const maxTimeMs = 2000; // 2 second limit
    
    for (const initialValues of initialGuesses) {
      // Check time limit
      if (Date.now() - startTime > maxTimeMs) break;
      
      try {
        const result = levenbergMarquardt(
          { x, y },
          sineFunction,
          {
            initialValues,
            damping: 1.8,
            maxIterations: 150, // Balanced for speed vs accuracy
            errorTolerance: 1e-8,
            gradientDifference: 1e-7,
          }
        );
        
        if (result.parameterValues) {
          const [a, b, c, d] = result.parameterValues;
          const rSquared = calculateRSquared(points, xi => a * Math.sin(b * xi + c) + d);
          
          if (rSquared > bestR2 && isFinite(rSquared) && rSquared >= 0) {
            bestR2 = rSquared;
            bestResult = { a, b, c, d, rSquared };
            
            // Early exit if excellent fit found
            if (rSquared > 0.999) break;
          }
        }
      } catch (e) {
        // Try next initialization
        continue;
      }
    }
    
    if (!bestResult) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to fit sine curve to the given points',
      };
    }
    
    const { a, b, c, d, rSquared } = bestResult;
    
    // Build formatted equation with clean formatting
    let equation = 'y = ';
    
    // a * sin(bx + c) term
    const aFormatted = formatCoefficient(a, false, useFractions);
    const bFormatted = formatCoefficient(b, false, useFractions);
    const cFormatted = formatCoefficient(c, true, useFractions);
    
    if (Math.abs(a - 1) < 1e-10) {
      equation += 'sin(';
    } else if (Math.abs(a + 1) < 1e-10) {
      equation += '-sin(';
    } else {
      equation += `${aFormatted} * sin(`;
    }
    
    if (Math.abs(b - 1) < 1e-10) {
      equation += 'x';
    } else if (Math.abs(b + 1) < 1e-10) {
      equation += '-x';
    } else {
      equation += `${bFormatted}x`;
    }
    
    if (Math.abs(c) > 1e-10) {
      equation += cFormatted;
    }
    
    equation += ')';
    
    // d constant term
    if (Math.abs(d) > 1e-10) {
      const dFormatted = formatCoefficient(d, true, useFractions);
      equation += dFormatted;
    }

    return {
      coefficients: { a, b, c, d },
      equation,
      rSquared,
    };
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: 'Unable to fit sine curve to the given points',
    };
  }
}

// Logarithmic approximation: y = a * ln(bx + c) + d using Levenberg-Marquardt  
function solveLog(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length < 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 3 points for logarithmic approximation',
    };
  }

  try {
    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    
    // Check for non-positive x values which would make ln undefined
    if (x.some(xi => xi <= 0)) {
      return {
        coefficients: {},
        equation: '',
        error: 'Logarithmic fit requires all x values to be positive',
      };
    }

    // Smart initial parameter estimation using log-linear regression
    const lnX = x.map(xi => Math.log(xi));
    const n = points.length;
    
    // Linear regression on y = a * ln(x) + d to get initial estimates
    const sumLnX = lnX.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumLnXY = lnX.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumLnX2 = lnX.reduce((sum, val) => sum + val * val, 0);
    
    const denominator = n * sumLnX2 - sumLnX * sumLnX;
    if (Math.abs(denominator) < 1e-10) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to fit logarithmic curve - insufficient variation in x values',
      };
    }
    
    const a_init = (n * sumLnXY - sumLnX * sumY) / denominator;
    const d_init = (sumY - a_init * sumLnX) / n;
    const b_init = 1.0; // Start with simple scaling
    const c_init = 0.0; // Start with no offset
    
    // Define the logarithmic function for Levenberg-Marquardt
    function logFunction([a, b, c, d]: number[]) {
      return (xi: number) => {
        const argument = b * xi + c;
        if (argument <= 0) return NaN; // Invalid for ln
        return a * Math.log(argument) + d;
      };
    }
    
    // Smart initialization strategies for <2 seconds
    const initialGuesses = [
      [a_init, b_init, c_init, d_init], // Primary linear fit
      [a_init, 0.5, 0, d_init],         // Scaled x
      [a_init, 2.0, 0, d_init],         // Stretched x  
      [a_init * 1.5, 1.0, 0, d_init],  // Scaled amplitude
      [a_init, 1.0, Math.min(...x) * 0.1, d_init], // Small offset
      [a_init, 1.0, Math.min(...x) * 0.5, d_init], // Medium offset
    ];
    
    let bestResult: any = null;
    let bestR2 = -Infinity;
    const startTime = Date.now();
    const maxTimeMs = 2000; // 2 second limit
    
    for (const initialValues of initialGuesses) {
      // Check time limit
      if (Date.now() - startTime > maxTimeMs) break;
      
      try {
        // Ensure the initial parameters don't cause invalid logarithms
        const minArgument = Math.min(...x.map(xi => b * xi + c));
        if (minArgument <= 0) continue; // Skip invalid initial guess
        
        const result = levenbergMarquardt(
          { x, y },
          logFunction,
          {
            initialValues,
            damping: 1.8,
            maxIterations: 120, // Balanced for speed
            errorTolerance: 1e-8,
            gradientDifference: 1e-6,
          }
        );
        
        if (result.parameterValues) {
          const [a_fit, b_fit, c_fit, d_fit] = result.parameterValues;
          
          // Validate that all evaluations are valid
          const isValid = x.every(xi => b_fit * xi + c_fit > 0);
          if (!isValid) continue;
          
          const rSquared = calculateRSquared(points, xi => {
            const arg = b_fit * xi + c_fit;
            return arg > 0 ? a_fit * Math.log(arg) + d_fit : NaN;
          });
          
          if (rSquared > bestR2 && isFinite(rSquared) && rSquared >= 0) {
            bestR2 = rSquared;
            bestResult = { a: a_fit, b: b_fit, c: c_fit, d: d_fit, rSquared };
            
            // Early exit if excellent fit found
            if (rSquared > 0.999) break;
          }
        }
      } catch (e) {
        // Try next initialization
        continue;
      }
    }
    
    if (!bestResult) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to fit logarithmic curve to the given points',
      };
    }
    
    const { a, b, c, d, rSquared } = bestResult;

    // Build formatted equation with proper coefficient handling
    let equation = 'y = ';
    
    // a * ln(bx + c) term
    const aFormatted = formatCoefficient(a, false, useFractions);
    const bFormatted = formatCoefficient(b, false, useFractions);
    const cFormatted = formatCoefficient(c, true, useFractions);
    
    if (Math.abs(a - 1) < 1e-10) {
      equation += 'ln(';
    } else if (Math.abs(a + 1) < 1e-10) {
      equation += '-ln(';
    } else {
      equation += `${aFormatted} * ln(`;
    }
    
    if (Math.abs(b - 1) < 1e-10) {
      equation += 'x';
    } else if (Math.abs(b + 1) < 1e-10) {
      equation += '-x';
    } else {
      equation += `${bFormatted}x`;
    }
    
    if (Math.abs(c) > 1e-10) {
      equation += cFormatted;
    }
    
    equation += ')';
    
    // d constant term
    if (Math.abs(d) > 1e-10) {
      const dFormatted = formatCoefficient(d, true, useFractions);
      equation += dFormatted;
    }

    return {
      coefficients: { a, b, c, d },
      equation,
      rSquared,
    };
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: 'Unable to fit logarithmic curve to the given points',
    };
  }
}

// Exponential approximation: y = a * e^(bx + c) + d using Levenberg-Marquardt
function solveExponential(points: DataPoint[], useFractions: boolean = true): SolverResult {
  if (points.length < 3) {
    return {
      coefficients: {},
      equation: '',
      error: 'Need at least 3 points for exponential approximation',
    };
  }

  try {
    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    
    // Smart initial parameter estimation using multiple strategies
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);
    const yRange = yMax - yMin;
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const xRange = xMax - xMin;
    
    // Strategy 1: Linear fit on log-transformed data (if all y > 0)
    let strategy1Result: any = null;
    if (y.every(yi => yi > 0)) {
      try {
        const lnY = y.map(yi => Math.log(yi));
        const n = points.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumLnY = lnY.reduce((sum, val) => sum + val, 0);
        const sumXLnY = x.reduce((sum, val, i) => sum + val * lnY[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
        
        const denominator = n * sumX2 - sumX * sumX;
        if (Math.abs(denominator) > 1e-10) {
          const b_est = (n * sumXLnY - sumX * sumLnY) / denominator;
          const A = (sumLnY - b_est * sumX) / n;
          const a_est = Math.exp(A);
          strategy1Result = { a: a_est, b: b_est, c: 0, d: 0 };
        }
      } catch (e) {
        // Strategy failed, continue
      }
    }
    
    // Strategy 2: Estimate with offset
    let strategy2Result: any = null;
    try {
      const d_est = yMin * 0.9; // Small offset below minimum
      const yShifted = y.map(yi => yi - d_est);
      
      if (yShifted.every(yi => yi > 0)) {
        const lnYShifted = yShifted.map(yi => Math.log(yi));
        const n = points.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumLnY = lnYShifted.reduce((sum, val) => sum + val, 0);
        const sumXLnY = x.reduce((sum, val, i) => sum + val * lnYShifted[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
        
        const denominator = n * sumX2 - sumX * sumX;
        if (Math.abs(denominator) > 1e-10) {
          const b_est = (n * sumXLnY - sumX * sumLnY) / denominator;
          const A = (sumLnY - b_est * sumX) / n;
          const a_est = Math.exp(A);
          strategy2Result = { a: a_est, b: b_est, c: 0, d: d_est };
        }
      }
    } catch (e) {
      // Strategy failed, continue
    }
    
    // Define the exponential function for Levenberg-Marquardt
    function exponentialFunction([a, b, c, d]: number[]) {
      return (xi: number) => a * Math.exp(b * xi + c) + d;
    }
    
    // Smart initialization strategies for <2 seconds
    const initialGuesses: number[][] = [];
    
    // Add successful strategy results first (highest priority)
    if (strategy1Result) {
      initialGuesses.push([strategy1Result.a, strategy1Result.b, strategy1Result.c, strategy1Result.d]);
    }
    if (strategy2Result) {
      initialGuesses.push([strategy2Result.a, strategy2Result.b, strategy2Result.c, strategy2Result.d]);
    }
    
    // Add most promising heuristic guesses
    initialGuesses.push(
      [yRange, 1 / xRange, 0, yMin],              // Growing exponential
      [yRange, -1 / xRange, 0, yMax],             // Decaying exponential
      [yRange * 0.5, 2 / xRange, 0, yMin],        // Faster growth
      [yRange * 2, 0.5 / xRange, 0, yMin],        // Slower growth
      [(yMax + yMin) / 2, 0.1, 0, (yMax + yMin) / 2], // Gentle growth
    );
    
    let bestResult: any = null;
    let bestR2 = -Infinity;
    const startTime = Date.now();
    const maxTimeMs = 2000; // 2 second limit
    
    for (const initialValues of initialGuesses) {
      // Check time limit
      if (Date.now() - startTime > maxTimeMs) break;
      
      try {
        // Test if initial values produce finite results
        const testVal = exponentialFunction(initialValues)(x[0]);
        if (!isFinite(testVal)) continue;
        
        const result = levenbergMarquardt(
          { x, y },
          exponentialFunction,
          {
            initialValues,
            damping: 2.5, // Balanced damping for exponential stability
            maxIterations: 100, // Reduced for speed
            errorTolerance: 1e-8,
            gradientDifference: 1e-6,
          }
        );
        
        if (result.parameterValues) {
          const [a_fit, b_fit, c_fit, d_fit] = result.parameterValues;
          
          // Validate that all evaluations are finite
          const isValid = x.every(xi => {
            const val = a_fit * Math.exp(b_fit * xi + c_fit) + d_fit;
            return isFinite(val) && !isNaN(val);
          });
          
          if (!isValid) continue;
          
          const rSquared = calculateRSquared(points, xi => a_fit * Math.exp(b_fit * xi + c_fit) + d_fit);
          
          if (rSquared > bestR2 && isFinite(rSquared) && rSquared >= 0) {
            bestR2 = rSquared;
            bestResult = { a: a_fit, b: b_fit, c: c_fit, d: d_fit, rSquared };
            
            // Early exit if excellent fit found
            if (rSquared > 0.999) break;
          }
        }
      } catch (e) {
        // Try next initialization
        continue;
      }
    }
    
    if (!bestResult) {
      return {
        coefficients: {},
        equation: '',
        error: 'Unable to fit exponential curve to the given points',
      };
    }
    
    const { a, b, c, d, rSquared } = bestResult;

    // Build formatted equation with clean coefficient handling
    let equation = 'y = ';
    
    // a * e^(bx + c) term
    const aFormatted = formatCoefficient(a, false, useFractions);
    const bFormatted = formatCoefficient(b, false, useFractions);
    const cFormatted = formatCoefficient(c, true, useFractions);
    
    if (Math.abs(a - 1) < 1e-10) {
      equation += 'e^(';
    } else if (Math.abs(a + 1) < 1e-10) {
      equation += '-e^(';
    } else {
      equation += `${aFormatted} * e^(`;
    }
    
    if (Math.abs(b - 1) < 1e-10) {
      equation += 'x';
    } else if (Math.abs(b + 1) < 1e-10) {
      equation += '-x';
    } else {
      equation += `${bFormatted}x`;
    }
    
    if (Math.abs(c) > 1e-10) {
      equation += cFormatted;
    }
    
    equation += ')';
    
    // d constant term
    if (Math.abs(d) > 1e-10) {
      const dFormatted = formatCoefficient(d, true, useFractions);
      equation += dFormatted;
    }

    return {
      coefficients: { a, b, c, d },
      equation,
      rSquared,
    };
  } catch (e) {
    return {
      coefficients: {},
      equation: '',
      error: 'Unable to fit exponential curve to the given points',
    };
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

function solveApproximationEquation(
  equationType: ApproximationEquationType,
  points: DataPoint[],
  useFractions: boolean = true
): SolverResult {
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

  return formatNumber(decimal);
}

function formatNumber(num: number): string {
  if (Math.abs(num - Math.round(num)) < 0.0001) {
    return Math.round(num).toString();
  }

  const rounded = parseFloat(num.toFixed(6));
  const str = rounded.toString();
  if (str.includes('.') && str.split('.')[1].length <= 3) {
    return str;
  }

  return num.toFixed(4);
}

function formatCoefficient(
  num: number,
  showSign: boolean = false,
  useFractions: boolean = true
): string {
  if (Math.abs(num) < 1e-10) {
    return showSign ? '' : '0';
  }

  const formatted = useFractions ? toFraction(num) : formatNumber(num);

  if (showSign) {
    if (num > 0) {
      return ` + ${formatted}`;
    } else {
      return ` - ${Math.abs(num) === num ? formatted : useFractions ? toFraction(Math.abs(num)) : formatNumber(Math.abs(num))}`;
    }
  }

  return formatted;
}

function buildPolynomialEquation(
  terms: Array<{ coef: number; term: string }>,
  useFractions: boolean
): string {
  let equation = 'y = ';
  let equationTerms: string[] = [];

  for (let i = 0; i < terms.length; i++) {
    const { coef, term } = terms[i];
    const isFirst = equationTerms.length === 0;
    const coefficientStr = formatCoefficient(coef, !isFirst, useFractions);

    if (coefficientStr !== '') {
      if (term === '') {
        equationTerms.push(coefficientStr);
      } else if (Math.abs(coef) === 1 && term !== '') {
        if (isFirst) {
          equationTerms.push(coef === 1 ? term : `-${term}`);
        } else {
          equationTerms.push(coef === 1 ? ` + ${term}` : ` - ${term}`);
        }
      } else {
        equationTerms.push(`${coefficientStr}${term}`);
      }
    }
  }

  equation += equationTerms.length > 0 ? equationTerms.join('') : '0';
  return equation;
}
