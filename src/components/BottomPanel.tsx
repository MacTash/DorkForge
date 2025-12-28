/**
 * BottomPanel - Enhanced Status Bar
 * Shows status info with Suggestions button on the right and improved visibility
 */

interface BottomPanelProps {
    hasQuery: boolean;
    onSuggestionsClick: () => void;
}

export function BottomPanel({ hasQuery, onSuggestionsClick }: BottomPanelProps) {
    return (
        <div className="status-bar">
            {/* Left side - Status and tips */}
            <div className="status-left">
                {/* Status */}
                <div className={`status-item ${hasQuery ? 'success' : ''}`}>
                    {hasQuery ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Ready to copy</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Enter search parameters to build query</span>
                        </>
                    )}
                </div>

                <div className="status-divider" />

                {/* Tip */}
                <div className="status-message">
                    <span className="tip-label">TIP:</span> Press Enter or comma to add tags. Use quotes for exact phrases.
                </div>
            </div>

            {/* Right side - Reference button */}
            <div className="status-right">
                <button className="suggestions-btn" onClick={onSuggestionsClick}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>REFERENCE</span>
                </button>
            </div>
        </div>
    );
}
