import type { Location } from '../../types';

interface LocationPanelProps {
  location: Location;
  onClose: () => void;
}

export default function LocationPanel({ location, onClose }: LocationPanelProps) {
  return (
    <div
      className="absolute right-4 top-4 z-10 w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white p-4 shadow-lg"
      role="dialog"
      aria-labelledby="location-title"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <h2 id="location-title" className="text-lg font-semibold text-gray-900">
          {location.name}
        </h2>
        <button
          onClick={onClose}
          className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close panel"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

	    {/* Source & availability badges */}
	    <div className="mb-3 flex flex-wrap gap-2">
	      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
	        EV Charger
	      </span>

	      <span
	        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
	          location.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
	        }`}
	      >
	        {location.available ? 'Available' : 'Unavailable'}
	      </span>
	    </div>

      {/* Details */}
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="font-medium text-gray-500">Address</dt>
          <dd className="text-gray-900">{location.address}</dd>
        </div>

	      	{location.operator && (
          <div>
            <dt className="font-medium text-gray-500">Operator</dt>
            <dd className="text-gray-900">{location.operator}</dd>
          </div>
        )}

	      	{/* EV-specific fields */}
	      	{location.connectionTypes.length > 0 && (
	      	  <div>
	      	    <dt className="font-medium text-gray-500">Connection Types</dt>
	      	    <dd className="flex flex-wrap gap-1">
	      	      {location.connectionTypes.map((type) => (
	      	        <span
	      	          key={type}
	      	          className="inline-flex rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
	      	        >
	      	          {type}
	      	        </span>
	      	      ))}
	      	    </dd>
	      	  </div>
	      	)}
	      	
	      	{location.powerKW && (
	      	  <div>
	      	    <dt className="font-medium text-gray-500">Max Power</dt>
	      	    <dd className="text-gray-900">{location.powerKW} kW</dd>
	      	  </div>
	      	)}
	      	
	      	<div>
	      	  <dt className="font-medium text-gray-500">Charging Points</dt>
	      	  <dd className="text-gray-900">{location.numberOfPoints}</dd>
	      	</div>

        <div>
          <dt className="font-medium text-gray-500">Coordinates</dt>
          <dd className="font-mono text-xs text-gray-600">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="mt-4 border-t pt-3">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Get Directions
        </a>
      </div>
    </div>
  );
}

