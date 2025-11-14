/**
 * FileUpload Component
 * Allows users to upload CSV files containing course hierarchy data
 * Replaces the HierarchySelector for file-based input
 */

import { useState, useRef } from 'react';
import { Hierarchy } from '../types';
import './FileUpload.css';

interface FileUploadProps {
  onFileUploaded: (hierarchy: Hierarchy) => void;
  onFileRemoved: () => void;
  label: string;
  position: number;
  uploadedHierarchy: Hierarchy | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileRemoved,
  label,
  position,
  uploadedHierarchy,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Dynamically import the CSV parser
      const { processCSVFile } = await import('../utils/csvParser');
      const hierarchy = await processCSVFile(file);
      onFileUploaded(hierarchy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
      console.error('Error processing CSV:', err);
    } finally {
      setIsProcessing(false);
      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    onFileRemoved();
  };

  return (
    <div className="file-upload">
      <label className="upload-label">{label}</label>
      
      <div className="upload-container">
        {!uploadedHierarchy ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="file-input"
              id={`file-input-${position}`}
              disabled={isProcessing}
            />
            <label
              htmlFor={`file-input-${position}`}
              className={`upload-button ${isProcessing ? 'processing' : ''}`}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="upload-icon">📁</span>
                  Upload CSV File
                </>
              )}
            </label>
            {error && <div className="upload-error">{error}</div>}
            <div className="upload-hint">
              Select a CSV file containing course lesson metadata
            </div>
          </>
        ) : (
          <div className="uploaded-file-info">
            <div className="file-info-header">
              <span className="file-icon">✓</span>
              <div className="file-details">
                <div className="file-name">{uploadedHierarchy.name}</div>
                <div className="file-meta">
                  {uploadedHierarchy.lessons?.length || 0} lessons • {uploadedHierarchy.subject || 'Unknown Subject'}
                  {uploadedHierarchy.implementationModel && ` • ${uploadedHierarchy.implementationModel}`}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={handleRemove}
              title="Remove file"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

