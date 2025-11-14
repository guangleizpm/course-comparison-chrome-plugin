/**
 * PasteInput Component
 * Allows users to paste tab-separated text from clipboard into course areas
 * Supports pasting table-like text with Title, Type, and ID columns
 */

import { useState, useRef, useEffect } from 'react';
import { Hierarchy } from '../types';
import './PasteInput.css';

interface PasteInputProps {
  onTextPasted: (hierarchy: Hierarchy) => void;
  onTextRemoved: () => void;
  label: string;
  position: number;
  pastedHierarchy: Hierarchy | null;
}

export const PasteInput: React.FC<PasteInputProps> = ({
  onTextPasted,
  onTextRemoved,
  label,
  position: _position,
  pastedHierarchy,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textValue, setTextValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Clear text when hierarchy is removed
    if (!pastedHierarchy && textValue) {
      setTextValue('');
    }
  }, [pastedHierarchy, textValue]);

  const handlePaste = async (_event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Allow default paste behavior, then process
    setTimeout(() => {
      processText();
    }, 0);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(event.target.value);
    setError(null);
  };

  const handleProcess = async () => {
    await processText();
  };

  const processText = async () => {
    const text = textareaRef.current?.value || textValue;
    
    if (!text.trim()) {
      setError('Please paste some text');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Dynamically import the text parser
      const { processTextContent } = await import('../utils/textParser');
      const hierarchy = processTextContent(text, label);
      onTextPasted(hierarchy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process pasted text');
      console.error('Error processing text:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setTextValue('');
    setError(null);
    onTextRemoved();
  };

  const handleClear = () => {
    setTextValue('');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus();
    }
  };

  return (
    <div className="paste-input">
      <label className="paste-label">{label}</label>
      
      <div className="paste-container">
        {!pastedHierarchy ? (
          <>
            <textarea
              ref={textareaRef}
              className="paste-textarea"
              placeholder="Paste your table data here (Title, Type, ID columns)..."
              value={textValue}
              onChange={handleTextChange}
              onPaste={handlePaste}
              disabled={isProcessing}
              rows={6}
            />
            <div className="paste-actions">
              <button
                type="button"
                className={`paste-button ${isProcessing ? 'processing' : ''}`}
                onClick={handleProcess}
                disabled={isProcessing || !textValue.trim()}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="paste-icon">📋</span>
                    Process Text
                  </>
                )}
              </button>
              {textValue && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={handleClear}
                  disabled={isProcessing}
                >
                  Clear
                </button>
              )}
            </div>
            {error && <div className="paste-error">{error}</div>}
            <div className="paste-hint">
              Paste tab-separated text with Title, Type, and ID columns
            </div>
          </>
        ) : (
          <div className="pasted-text-info">
            <div className="text-info-header">
              <span className="text-icon">✓</span>
              <div className="text-details">
                <div className="text-name">{pastedHierarchy.name}</div>
                <div className="text-meta">
                  {pastedHierarchy.lessons?.length || 0} lessons • {pastedHierarchy.subject || 'Unknown Subject'}
                  {pastedHierarchy.implementationModel && ` • ${pastedHierarchy.implementationModel}`}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={handleRemove}
              title="Remove pasted text"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

