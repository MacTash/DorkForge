/**
 * LeftPanel - Source Intelligence
 * Clean design with tag inputs for query parameters
 */

import { TagInput } from './TagInput';

interface DorkFormState {
    domains: string[];
    inUrl: string[];
    inTitle: string[];
    exactTerms: string[];
    broadTerms: string[];
    fileTypes: string[];
    excludeTerms: string[];
    inText: string[];
}

interface LeftPanelProps {
    state: DorkFormState;
    onUpdate: <K extends keyof DorkFormState>(key: K, value: DorkFormState[K]) => void;
}

export function LeftPanel({ state, onUpdate }: LeftPanelProps) {
    return (
        <div className="left-panel">
            {/* Header */}
            <div className="panel-header">
                <h2 className="panel-title accent">SOURCE INTELLIGENCE</h2>
                <p className="panel-subtitle">Define input parameters for query generation.</p>
            </div>

            <div className="panel-content">
                {/* Target Scope */}
                <section className="section">
                    <h3 className="section-title">Target Scope</h3>

                    <TagInput
                        label="TARGET DOMAINS (SITE:)"
                        placeholder="example.com"
                        values={state.domains}
                        onChange={(v) => onUpdate('domains', v)}
                    />

                    <TagInput
                        label="IN URL (INURL:)"
                        placeholder="about us"
                        values={state.inUrl}
                        onChange={(v) => onUpdate('inUrl', v)}
                    />
                </section>

                {/* Content Filters */}
                <section className="section">
                    <h3 className="section-title">Content Filters</h3>

                    <TagInput
                        label="EXACT PHRASES (QUOTED)"
                        placeholder="top secret"
                        values={state.exactTerms}
                        onChange={(v) => onUpdate('exactTerms', v)}
                    />

                    <TagInput
                        label="BROAD TERMS (AND)"
                        placeholder="password, confidential"
                        values={state.broadTerms}
                        onChange={(v) => onUpdate('broadTerms', v)}
                    />

                    <TagInput
                        label="IN TITLE (INTITLE:)"
                        placeholder="index of"
                        values={state.inTitle}
                        onChange={(v) => onUpdate('inTitle', v)}
                    />

                    <TagInput
                        label="IN BODY (INTEXT:)"
                        placeholder="password, API_KEY"
                        values={state.inText}
                        onChange={(v) => onUpdate('inText', v)}
                    />
                </section>

                {/* Technical Selectors */}
                <section className="section">
                    <h3 className="section-title">Technical Selectors</h3>

                    <TagInput
                        label="FILE TYPES (FILETYPE:)"
                        placeholder="pdf, docx, xlsx, sql, env"
                        values={state.fileTypes}
                        onChange={(v) => onUpdate('fileTypes', v)}
                    />

                    <TagInput
                        label="EXCLUSIONS (NOT / -)"
                        placeholder="stackoverflow, github"
                        values={state.excludeTerms}
                        onChange={(v) => onUpdate('excludeTerms', v)}
                    />
                </section>
            </div>
        </div>
    );
}

export type { DorkFormState };
