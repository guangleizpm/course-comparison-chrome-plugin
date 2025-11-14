/**
 * ComparisonResults Component
 * Displays comparison results in a side-by-side layout
 * Shows metadata comparison side-by-side with anchor on the left
 */

import React, { useState, useEffect } from 'react';
import { Hierarchy, ComparisonResult } from '../types';
import './ComparisonResults.css';

interface ComparisonResultsProps {
  comparisonResults: ComparisonResult[];
  selectedHierarchies: Array<{ hierarchyId: string; versionId: string } | null>;
  hierarchies: Hierarchy[];
  viewMode: 'metadata' | 'lesson-comparison';
  isTwoWay: boolean;
  isThreeWay: boolean;
  anchorHierarchyId: string | null;
}

export const ComparisonResults: React.FC<ComparisonResultsProps> = ({
  comparisonResults: _comparisonResults,
  selectedHierarchies,
  hierarchies,
  viewMode: _viewMode,
  isTwoWay: _isTwoWay,
  isThreeWay: _isThreeWay,
  anchorHierarchyId,
}) => {
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState<number>(0);

  // Get anchor hierarchy
  const anchorHierarchy = anchorHierarchyId
    ? hierarchies.find(h => h.id === anchorHierarchyId) || null
    : null;

  // Get non-anchor hierarchies for comparison
  const comparedHierarchies = selectedHierarchies
    .map((h) => {
      if (!h || h.hierarchyId === anchorHierarchyId) return null;
      const hierarchy = hierarchies.find(hi => hi.id === h.hierarchyId);
      return hierarchy || null;
    })
    .filter((h): h is Hierarchy => h !== null);

  // Reset comparison index if it's out of bounds
  useEffect(() => {
    if (currentComparisonIndex >= comparedHierarchies.length && comparedHierarchies.length > 0) {
      setCurrentComparisonIndex(0);
    }
  }, [comparedHierarchies.length, currentComparisonIndex]);

  // Get metadata field value from hierarchy
  const getMetadataValue = (hierarchy: Hierarchy, field: string): any => {
    switch (field) {
      case 'Subject':
        return hierarchy.subject || 'Not Set Yet';
      case 'Implementation Model':
        return hierarchy.implementationModel || 'Not Set Yet';
      case 'Course ID':
        return hierarchy.courseId || 'Not Set Yet';
      case 'Type':
        return hierarchy.type || 'Not Set Yet';
      case 'Version':
        return hierarchy.currentVersion?.versionNumber || 'Not Set Yet';
      case 'Publishing Restrictions':
        return 'Not Set Yet'; // Mock data
      case 'Course Prerequisites':
        return 'Not Set Yet'; // Mock data
      case 'Description':
        return 'Not Set Yet'; // Mock data
      case 'Course Length':
        return 'Year'; // Mock data
      case 'Series':
        return ['EdgeEX']; // Mock data
      case 'State Specific':
        return ''; // Mock data
      default:
        return 'Not Set Yet';
    }
  };

  // Check if field values differ
  const isFieldDifferent = (anchorValue: any, comparedValue: any): boolean => {
    if (Array.isArray(anchorValue) && Array.isArray(comparedValue)) {
      return JSON.stringify(anchorValue) !== JSON.stringify(comparedValue);
    }
    return String(anchorValue) !== String(comparedValue);
  };

  // Get all metadata fields to display
  const metadataFields = [
    'Subject',
    'Publishing Restrictions',
    'Course Prerequisites',
    'Description',
    'Implementation Model',
    'Course Length',
    'Series',
    'State Specific',
    'Course ID',
    'Type',
    'Version',
  ];

  const renderSideBySideMetadata = () => {
    if (!anchorHierarchy) {
      return (
        <div className="metadata-comparison-empty">
          <p>Please select an anchor course to view metadata comparison.</p>
        </div>
      );
    }

    if (comparedHierarchies.length === 0) {
      return (
        <div className="metadata-comparison-empty">
          <p>Please select a course to compare with the anchor course.</p>
        </div>
      );
    }

    const comparedHierarchy = comparedHierarchies[currentComparisonIndex] || comparedHierarchies[0];

    return (
      <div className="metadata-comparison-view">
        <div className="metadata-comparison-header">
          <div className="metadata-course-header anchor-course">
            <h3>{anchorHierarchy.name}</h3>
            <span className="course-label">Anchor Course</span>
            {anchorHierarchy.currentVersion && (
              <span className="version-label">
                Version {anchorHierarchy.currentVersion.versionNumber} ({anchorHierarchy.currentVersion.versionId})
              </span>
            )}
          </div>
          <div className="metadata-course-header compared-course">
            <h3>{comparedHierarchy.name}</h3>
            <span className="course-label">Compared Course</span>
            {comparedHierarchy.currentVersion && (
              <span className="version-label">
                Version {comparedHierarchy.currentVersion.versionNumber} ({comparedHierarchy.currentVersion.versionId})
              </span>
            )}
          </div>
        </div>

        <div className="metadata-comparison-table">
          <div className="metadata-table-header">
            <div className="metadata-col anchor-col">Anchor Course Metadata</div>
            <div className="metadata-col compared-col">Compared Course Metadata</div>
          </div>

          <div className="metadata-table-body">
            {metadataFields.map((field) => {
              const anchorValue = getMetadataValue(anchorHierarchy, field);
              const comparedValue = getMetadataValue(comparedHierarchy, field);
              const isDifferent = isFieldDifferent(anchorValue, comparedValue);

              return (
                <div
                  key={field}
                  className={`metadata-comparison-row ${isDifferent ? 'metadata-different' : ''}`}
                >
                  <div className="metadata-col anchor-col">
                    <div className="metadata-field-label">{field}</div>
                    <div className="metadata-field-value">
                      {Array.isArray(anchorValue) ? (
                        <div className="metadata-array">
                          {anchorValue.map((item, idx) => (
                            <span key={idx} className="metadata-array-item">
                              {String(item)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>{String(anchorValue) || '—'}</span>
                      )}
                    </div>
                  </div>
                  <div className="metadata-col compared-col">
                    <div className="metadata-field-label">{field}</div>
                    <div className="metadata-field-value">
                      {Array.isArray(comparedValue) ? (
                        <div className="metadata-array">
                          {comparedValue.map((item, idx) => (
                            <span key={idx} className="metadata-array-item">
                              {String(item)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>{String(comparedValue) || '—'}</span>
                      )}
                    </div>
                  </div>
                  {isDifferent && (
                    <div className="metadata-difference-indicator">⚠</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation for multiple comparisons */}
        {comparedHierarchies.length > 1 && (
          <div className="metadata-comparison-navigation">
            <button
              className="nav-button"
              onClick={() => setCurrentComparisonIndex(currentComparisonIndex - 1)}
              disabled={currentComparisonIndex === 0}
            >
              ← Previous
            </button>
            <span className="comparison-counter">
              Comparison {currentComparisonIndex + 1} of {comparedHierarchies.length}
            </span>
            <button
              className="nav-button"
              onClick={() => setCurrentComparisonIndex(currentComparisonIndex + 1)}
              disabled={currentComparisonIndex === comparedHierarchies.length - 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comparison-results">
      {renderSideBySideMetadata()}
    </div>
  );
};

