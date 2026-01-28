import type { ErrorHandler as HonoErrorHandler } from 'hono';
import { ZodError } from 'zod';

/**
 * RFC 7807 Problem Details response shape.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

// Base URI for problem types (could be a real docs URL in production)
const PROBLEM_TYPE_BASE = 'https://api.example.com/problems';

/**
 * Application error that maps to RFC 7807 Problem Details.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    public title: string,
    public detail?: string,
  ) {
    super(detail ?? title);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toProblemDetails(instance?: string): ProblemDetails {
    return {
      type: `${PROBLEM_TYPE_BASE}/${this.type}`,
      title: this.title,
      status: this.status,
      ...(this.detail && { detail: this.detail }),
      ...(instance && { instance }),
    };
  }
}

function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    error.name === 'ApiError' &&
    typeof (error as ApiError).status === 'number' &&
    typeof (error as ApiError).type === 'string'
  );
}

function problemResponse(
  c: Parameters<HonoErrorHandler>[1],
  problem: ProblemDetails,
) {
  return c.json(problem, {
    status: problem.status as 400 | 401 | 403 | 404 | 500 | 502 | 503,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

export const errorHandler: HonoErrorHandler = (error, c) => {
  console.error('Error:', error?.message ?? String(error));

  const instance = c.req.path;

  if (isApiError(error)) {
    return problemResponse(c, error.toProblemDetails(instance));
  }

  if (error instanceof ZodError) {
    const problem: ProblemDetails = {
      type: `${PROBLEM_TYPE_BASE}/validation-error`,
      title: 'Validation Error',
      status: 400,
      detail: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      instance,
    };
    return problemResponse(c, problem);
  }

  const problem: ProblemDetails = {
    type: `${PROBLEM_TYPE_BASE}/internal-error`,
    title: 'Internal Server Error',
    status: 500,
    instance,
  };
  return problemResponse(c, problem);
};
