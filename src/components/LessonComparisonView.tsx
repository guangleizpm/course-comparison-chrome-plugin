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

// Match lessons by exact ID, base ID, or title similarity
const findMatchingLesson = (
  anchorLesson: Lesson,
  comparedLessons: Lesson[]
): Lesson | null => {
  // First try exact ID match (for pasted data and CSV data with exact IDs)
  const exactMatch = comparedLessons.find(lesson => lesson.id === anchorLesson.id);
  if (exactMatch) return exactMatch;
  
  // Then try base ID match (for CSV data with prefixed IDs)
  const baseId = getBaseLessonId(anchorLesson.id);
  const matchById = comparedLessons.find(lesson => {
    const comparedBaseId = getBaseLessonId(lesson.id);
    return comparedBaseId === baseId;
  });
  
  if (matchById) return matchById;
  
  // Fallback: match by title (for lessons with same content but different IDs)
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
  const addedLessons: LessonComparison[] = [];
  comparedLessons.forEach(comparedLesson => {
    if (!matchedComparedIds.has(comparedLesson.id)) {
      addedLessons.push({
        anchorLesson: null,
        comparedLesson,
        status: 'added',
        anchorOrder: 0,
        comparedOrder: comparedLesson.order,
      });
    }
  });
  
  // Sort comparisons by anchor order (matched lessons)
  comparisons.sort((a, b) => {
    if (a.anchorOrder !== b.anchorOrder) {
      return a.anchorOrder - b.anchorOrder;
    }
    return (a.comparedOrder || 0) - (b.comparedOrder || 0);
  });
  
  // Insert added lessons at their correct position based on compared order
  // Sort added lessons by their compared order
  addedLessons.sort((a, b) => (a.comparedOrder || 0) - (b.comparedOrder || 0));
  
  // For each added lesson, find where it should be inserted based on compared order
  addedLessons.forEach(addedLesson => {
    const addedOrder = addedLesson.comparedOrder || 0;
    
    // Find the first comparison where the compared order is greater than the added lesson's order
    // This ensures added lessons appear in the same order as in the compared course
    const insertIndex = comparisons.findIndex(comp => {
      // Only consider comparisons that have a comparedOrder (matched or other added lessons)
      if (comp.comparedOrder === null) return false;
      return comp.comparedOrder > addedOrder;
    });
    
    if (insertIndex === -1) {
      // Add at the end if no insertion point found (added lesson is after all existing lessons)
      comparisons.push(addedLesson);
    } else {
      // Insert at the correct position (before the first lesson with higher compared order)
      comparisons.splice(insertIndex, 0, addedLesson);
    }
  });
  
  return comparisons;
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

  // Get children (Activities/Quizzes) from lesson metadata
  const getLessonChildren = (lesson: Lesson | null): Array<{ id: string; title: string; type: string }> => {
    if (!lesson || !lesson.metadata?.children) return [];
    return (lesson.metadata.children as Array<{ id: string; title: string; type: string }>) || [];
  };

  // Compare children between two lessons
  const compareChildren = (
    anchorChildren: Array<{ id: string; title: string; type: string }>,
    comparedChildren: Array<{ id: string; title: string; type: string }>
  ) => {
    const anchorMap = new Map(anchorChildren.map(c => [c.id, c]));
    const comparedMap = new Map(comparedChildren.map(c => [c.id, c]));
    
    const allChildIds = new Set([...anchorChildren.map(c => c.id), ...comparedChildren.map(c => c.id)]);
    
    return Array.from(allChildIds).map(id => {
      const anchorChild = anchorMap.get(id);
      const comparedChild = comparedMap.get(id);
      
      if (anchorChild && comparedChild) {
        return { anchorChild, comparedChild, status: 'same' as const };
      } else if (anchorChild) {
        return { anchorChild, comparedChild: null, status: 'removed' as const };
      } else {
        return { anchorChild: null, comparedChild, status: 'added' as const };
      }
    });
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
          {comparisons.map((comparison, index) => {
            const anchorChildren = getLessonChildren(comparison.anchorLesson);
            const comparedChildren = getLessonChildren(comparison.comparedLesson);
            const hasChildren = anchorChildren.length > 0 || comparedChildren.length > 0;
            
            // For removed lessons, show only anchor children
            // For added lessons, show only compared children
            // For matched lessons, compare both
            let childrenToDisplay: Array<{
              anchorChild: { id: string; title: string; type: string } | null;
              comparedChild: { id: string; title: string; type: string } | null;
              status: 'same' | 'removed' | 'added';
            }> = [];
            
            if (comparison.status === 'removed' && anchorChildren.length > 0) {
              // Removed lesson - show all anchor children as removed
              childrenToDisplay = anchorChildren.map(child => ({
                anchorChild: child,
                comparedChild: null,
                status: 'removed' as const,
              }));
            } else if (comparison.status === 'added' && comparedChildren.length > 0) {
              // Added lesson - show all compared children as added
              childrenToDisplay = comparedChildren.map(child => ({
                anchorChild: null,
                comparedChild: child,
                status: 'added' as const,
              }));
            } else if (comparison.anchorLesson && comparison.comparedLesson) {
              // Matched lesson - compare children
              const compared = compareChildren(anchorChildren, comparedChildren);
              childrenToDisplay = compared.map(comp => ({
                anchorChild: comp.anchorChild || null,
                comparedChild: comp.comparedChild || null,
                status: comp.status,
              }));
            }
            
            return (
              <div key={`comparison-${index}`}>
                <div
                  className={`lesson-comparison-row ${getStatusClass(comparison.status)}`}
                >
              <div className={`lesson-col anchor-col ${comparison.status === 'added' ? 'empty-cell' : ''}`}>
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
                
                {/* Display children (Activities/Quizzes) if they exist */}
                {hasChildren && childrenToDisplay.length > 0 && (
                  <div className="lesson-children-container">
                    {childrenToDisplay.map((childComp, childIndex) => (
                      <div
                        key={`child-${index}-${childIndex}`}
                        className={`lesson-child-row ${getStatusClass(childComp.status)}`}
                      >
                        <div className={`lesson-col anchor-col ${childComp.status === 'added' ? 'empty-cell' : ''}`}>
                          {childComp.anchorChild ? (
                            <div className="child-item">
                              <span className="child-type">{childComp.anchorChild.type}:</span>
                              <span className="child-title">{childComp.anchorChild.title}</span>
                            </div>
                          ) : (
                            <div className="child-item empty">—</div>
                          )}
                        </div>
                        <div className={`lesson-col compared-col ${childComp.status === 'removed' ? 'empty-cell' : ''}`}>
                          {childComp.comparedChild ? (
                            <div className="child-item">
                              <span className="child-type">{childComp.comparedChild.type}:</span>
                              <span className="child-title">{childComp.comparedChild.title}</span>
                            </div>
                          ) : (
                            <div className="child-item empty">—</div>
                          )}
                        </div>
                        <div className={`child-status-badge ${getStatusClass(childComp.status)}`}>
                          {getStatusLabel(childComp.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

