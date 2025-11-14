/**
 * ComparisonView Component
 * Main comparison interface supporting 2 or 3 hierarchy side-by-side comparison
 * Displays metadata issues and lesson comparison
 */

import React, { useState, useEffect } from 'react';
import { Hierarchy, ComparisonResult } from '../types';
import { ComparisonResults } from './ComparisonResults';
import { LessonComparisonView } from './LessonComparisonView';
import './ComparisonView.css';

interface ComparisonViewProps {
  hierarchies: Hierarchy[];
  selectedHierarchies: Array<{ hierarchyId: string; versionId: string } | null>;
  comparisonResults: ComparisonResult[];
  anchorHierarchyId: string | null;
  inputMode?: 'upload' | 'paste';
}

type ViewMode = 'metadata' | 'lesson-comparison';

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  hierarchies,
  selectedHierarchies,
  comparisonResults,
  anchorHierarchyId,
  inputMode = 'upload',
}) => {
  // Default to lesson-comparison view for paste mode (no metadata available)
  const [viewMode, setViewMode] = useState<ViewMode>(inputMode === 'paste' ? 'lesson-comparison' : 'metadata');
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState<number>(0);

  // Update view mode when input mode changes
  useEffect(() => {
    if (inputMode === 'paste') {
      setViewMode('lesson-comparison');
    }
  }, [inputMode]);

  const selectedCount = selectedHierarchies.filter(h => h !== null).length;
  const isTwoWay = selectedCount === 2;
  const isThreeWay = selectedCount === 3;

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

  if (selectedCount < 2) {
    return (
      <div className="comparison-view-empty">
        <div className="empty-state">
          <h3>Select at least 2 hierarchies to compare</h3>
          <p>Choose hierarchies from the selection panels above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-view">
      {/* View Mode Tabs */}
      {/* Hide Metadata Issues tab in paste mode since pasted text doesn't include metadata */}
      {inputMode === 'upload' && (
        <div className="view-mode-tabs">
          <button
            className={`tab ${viewMode === 'metadata' ? 'active' : ''}`}
            onClick={() => setViewMode('metadata')}
          >
            Metadata Issues
          </button>
          {anchorHierarchy && (
            <button
              className={`tab ${viewMode === 'lesson-comparison' ? 'active' : ''}`}
              onClick={() => setViewMode('lesson-comparison')}
            >
              Lesson Comparison
            </button>
          )}
        </div>
      )}
      {/* Show only Lesson Comparison tab in paste mode */}
      {inputMode === 'paste' && anchorHierarchy && (
        <div className="view-mode-tabs">
          <button
            className={`tab active`}
            disabled
          >
            Lesson Comparison
          </button>
        </div>
      )}

      {/* Comparison Content */}
      <div className="comparison-content">
        {/* In paste mode, always show lesson comparison; in upload mode, respect viewMode */}
        {((inputMode === 'paste' && anchorHierarchy) || (viewMode === 'lesson-comparison' && anchorHierarchy)) ? (
          <div className="lesson-comparison-container">
            {comparedHierarchies.length === 0 ? (
              <div className="lesson-comparison-empty">
                <p>Please select a course to compare with the anchor course.</p>
              </div>
            ) : comparedHierarchies.length === 1 ? (
              <LessonComparisonView
                anchorHierarchy={anchorHierarchy}
                comparedHierarchy={comparedHierarchies[0]}
                hierarchies={hierarchies}
              />
            ) : (
              <div className="multi-comparison-view">
                <div className="comparison-navigation">
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
                <LessonComparisonView
                  anchorHierarchy={anchorHierarchy}
                  comparedHierarchy={comparedHierarchies[currentComparisonIndex]}
                  hierarchies={hierarchies}
                />
              </div>
            )}
          </div>
        ) : (
          <ComparisonResults
            comparisonResults={comparisonResults}
            selectedHierarchies={selectedHierarchies}
            hierarchies={hierarchies}
            viewMode={viewMode}
            isTwoWay={isTwoWay}
            isThreeWay={isThreeWay}
            anchorHierarchyId={anchorHierarchyId}
          />
        )}
      </div>

      {/* Summary Stats */}
      <div className="comparison-summary">
        <div className="summary-stat">
          <span className="stat-label">Metadata Issues:</span>
          <span className="stat-value">
            {comparisonResults.reduce((sum, r) => sum + r.metadataIssues.length, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

