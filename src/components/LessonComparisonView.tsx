/**
 * LessonComparisonView Component
 * Displays side-by-side lesson comparison between anchor course and compared course
 * Shows lesson alignment, order differences, removed lessons, and added lessons
 */

import React from 'react';
import { Hierarchy, Lesson, LessonComparison } from '../types';
import './LessonComparisonView.css';

interface LessonComparisonViewProps {
  anchorHierarchy: Hierarchy | null;
  comparedHierarchy: Hierarchy | null;
  hierarchies: Hierarchy[];
}

// Extract base lesson ID for matching (removes course prefix)
const getBaseLessonId = (lessonId: string): string => {
  // Extract the base ID after the first hyphen (e.g., "ic-lesson-1" -> "lesson-1")
  const parts = lessonId.split('-');
  if (parts.length >= 3 && parts[1] === 'lesson') {
    // For pattern like "ic-lesson-1", return "lesson-1"
    return parts.slice(1).join('-');
  }
  // For new lessons (e.g., "cr-new-1"), return a unique identifier
  if (lessonId.includes('-new-')) {
    return `new-${lessonId}`; // Make it unique so it doesn't match
  }
  return lessonId;
};

// Match lessons by base ID or title similarity
const findMatchingLesson = (
  anchorLesson: Lesson,
  comparedLessons: Lesson[]
): Lesson | null => {
  const baseId = getBaseLessonId(anchorLesson.id);
  
  // First try to match by base ID
  const matchById = comparedLessons.find(lesson => {
    const comparedBaseId = getBaseLessonId(lesson.id);
    return comparedBaseId === baseId;
  });
  
  if (matchById) return matchById;
  
  // Fallback: match by title (for lessons with same content)
  const matchByTitle = comparedLessons.find(lesson => 
    lesson.title === anchorLesson.title
  );
  
  return matchByTitle || null;
};

// Generate comparison data aligned by anchor course
const generateLessonComparisons = (
  anchorLessons: Lesson[],
  comparedLessons: Lesson[]
): LessonComparison[] => {
  const comparisons: LessonComparison[] = [];
  const matchedComparedIds = new Set<string>();
  
  // Process each anchor lesson
  anchorLessons.forEach(anchorLesson => {
    const matchedLesson = findMatchingLesson(anchorLesson, comparedLessons);
    
    if (matchedLesson) {
      matchedComparedIds.add(matchedLesson.id);
      comparisons.push({
        anchorLesson,
        comparedLesson: matchedLesson,
        status: anchorLesson.order === matchedLesson.order ? 'same' : 'order-changed',
        anchorOrder: anchorLesson.order,
        comparedOrder: matchedLesson.order,
      });
    } else {
      // Lesson removed from compared course
      comparisons.push({
        anchorLesson,
        comparedLesson: null,
        status: 'removed',
        anchorOrder: anchorLesson.order,
        comparedOrder: null,
      });
    }
  });
  
  // Find lessons added in compared course (not in anchor)
  comparedLessons.forEach(comparedLesson => {
    if (!matchedComparedIds.has(comparedLesson.id)) {
      comparisons.push({
        anchorLesson: null,
        comparedLesson,
        status: 'added',
        anchorOrder: 0,
        comparedOrder: comparedLesson.order,
      });
    }
  });
  
  // Sort by anchor order, then by compared order for added lessons
  return comparisons.sort((a, b) => {
    if (a.anchorOrder === 0) return 1; // Added lessons go to end
    if (b.anchorOrder === 0) return -1;
    if (a.anchorOrder !== b.anchorOrder) {
      return a.anchorOrder - b.anchorOrder;
    }
    return (a.comparedOrder || 0) - (b.comparedOrder || 0);
  });
};

export const LessonComparisonView: React.FC<LessonComparisonViewProps> = ({
  anchorHierarchy,
  comparedHierarchy,
  hierarchies: _hierarchies,
}) => {
  if (!anchorHierarchy || !comparedHierarchy) {
    return (
      <div className="lesson-comparison-empty">
        <p>Please select both an anchor course and a course to compare.</p>
      </div>
    );
  }

  const anchorLessons = anchorHierarchy.lessons || [];
  const comparedLessons = comparedHierarchy.lessons || [];
  const comparisons = generateLessonComparisons(anchorLessons, comparedLessons);

  const getStatusClass = (status: LessonComparison['status']) => {
    switch (status) {
      case 'same':
        return 'status-same';
      case 'order-changed':
        return 'status-order-changed';
      case 'removed':
        return 'status-removed';
      case 'added':
        return 'status-added';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: LessonComparison['status']) => {
    switch (status) {
      case 'same':
        return '✓ Same';
      case 'order-changed':
        return '↔ Order Changed';
      case 'removed':
        return '− Removed';
      case 'added':
        return '+ Added';
      default:
        return '';
    }
  };

  return (
    <div className="lesson-comparison-view">
      <div className="lesson-comparison-header">
        <div className="comparison-course-header anchor-course">
          <h3>{anchorHierarchy.name}</h3>
          <span className="course-label">Anchor Course</span>
        </div>
        <div className="comparison-course-header compared-course">
          <h3>{comparedHierarchy.name}</h3>
          <span className="course-label">Compared Course</span>
        </div>
      </div>

      <div className="lesson-comparison-table">
        <div className="lesson-table-header">
          <div className="lesson-col anchor-col">Anchor Course Lessons</div>
          <div className="lesson-col compared-col">Compared Course Lessons</div>
        </div>

        <div className="lesson-table-body">
          {comparisons.map((comparison, index) => (
            <div
              key={`comparison-${index}`}
              className={`lesson-comparison-row ${getStatusClass(comparison.status)}`}
            >
              <div className="lesson-col anchor-col">
                {comparison.anchorLesson ? (
                  <div className="lesson-item">
                    <div className="lesson-order">#{comparison.anchorOrder}</div>
                    <div className="lesson-title">{comparison.anchorLesson.title}</div>
                    {comparison.anchorLesson.variant && (
                      <div className="lesson-variant">{comparison.anchorLesson.variant}</div>
                    )}
                  </div>
                ) : (
                  <div className="lesson-item empty">—</div>
                )}
              </div>
              <div className="lesson-col compared-col">
                {comparison.comparedLesson ? (
                  <div className="lesson-item">
                    <div className="lesson-order">#{comparison.comparedOrder}</div>
                    <div className="lesson-title">{comparison.comparedLesson.title}</div>
                    {comparison.comparedLesson.variant && (
                      <div className="lesson-variant">{comparison.comparedLesson.variant}</div>
                    )}
                  </div>
                ) : (
                  <div className="lesson-item empty">—</div>
                )}
              </div>
              <div className={`lesson-status-badge ${getStatusClass(comparison.status)}`}>
                {getStatusLabel(comparison.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lesson-comparison-summary">
        <div className="summary-item">
          <span className="summary-label">Total Anchor Lessons:</span>
          <span className="summary-value">{anchorLessons.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Compared Lessons:</span>
          <span className="summary-value">{comparedLessons.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Matching Lessons:</span>
          <span className="summary-value status-same">
            {comparisons.filter(c => c.status === 'same').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Order Changed:</span>
          <span className="summary-value status-order-changed">
            {comparisons.filter(c => c.status === 'order-changed').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Removed from Compared:</span>
          <span className="summary-value status-removed">
            {comparisons.filter(c => c.status === 'removed').length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Added in Compared:</span>
          <span className="summary-value status-added">
            {comparisons.filter(c => c.status === 'added').length}
          </span>
        </div>
      </div>
    </div>
  );
};

