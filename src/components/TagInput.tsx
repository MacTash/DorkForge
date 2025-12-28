/**
 * TagInput Component
 * Multi-value tag input with Enter/comma to add
 */

import { useState, KeyboardEvent } from 'react';

interface TagInputProps {
    label: string;
    placeholder?: string;
    values: string[];
    onChange: (values: string[]) => void;
}

export function TagInput({ label, placeholder, values, onChange }: TagInputProps) {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !input && values.length > 0) {
            removeTag(values.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = input.trim().replace(/^,|,$/g, '');
        if (!trimmed) return;
        if (values.includes(trimmed)) {
            setInput('');
            return;
        }
        onChange([...values, trimmed]);
        setInput('');
    };

    const removeTag = (index: number) => {
        const newValues = [...values];
        newValues.splice(index, 1);
        onChange(newValues);
    };

    return (
        <div className="tag-input-group">
            <label className="tag-input-label">
                {label}
            </label>
            <div className="tag-input-container">
                {values.map((tag, idx) => (
                    <span key={idx} className="tag">
                        {tag}
                        <button onClick={() => removeTag(idx)} className="tag-remove" type="button">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    className="tag-input"
                    placeholder={values.length === 0 ? placeholder : ''}
                />
            </div>
        </div>
    );
}
