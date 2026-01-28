interface ErrorMessageProps {
	title?: string;
	message: string;
	code?: string;
	onRetry?: () => void;
}

export default function ErrorMessage({ title = 'Error loading data', message, code, onRetry }: ErrorMessageProps) {
  return (
    <div
      className="absolute left-4 top-4 z-10 max-w-sm rounded-lg bg-red-50 p-4 shadow-md"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
			    <div className="flex-1">
			      <p className="text-sm font-medium text-red-800">{title}</p>
			      <p className="mt-1 text-sm text-red-700">{message}</p>
	          {code && (
	            <p className="mt-1 text-xs font-mono text-red-500">Error code: {code}</p>
	          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

