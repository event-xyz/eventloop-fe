import React from 'react';

export function Loading({ state = 'loading' }) {
    // Determine the text and animation based on the state (loading or submitting)
    const loadingText = state === 'loading' ? 'Loading...' : 'Submitting...';
    const dotColor = state === 'loading' ? 'bg-gray-500' : 'bg-blue-500'; // Example: different color for submitting

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
                <span className="text-xl font-medium text-gray-500 animate-pulse">
                    {loadingText}
                </span>
                <div className="flex space-x-1">
                    <div className={`w-2.5 h-2.5 ${dotColor} rounded-full animate-bounce delay-200`}></div>
                    <div className={`w-2.5 h-2.5 ${dotColor} rounded-full animate-bounce delay-400`}></div>
                    <div className={`w-2.5 h-2.5 ${dotColor} rounded-full animate-bounce delay-600`}></div>
                </div>
            </div>
        </div>
    );
}
