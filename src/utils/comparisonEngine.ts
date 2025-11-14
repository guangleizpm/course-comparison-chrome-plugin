/**
 * Comparison Engine
 * Generates comparison results from uploaded hierarchies
 * Performs client-side comparison without backend services
 */

import { Hierarchy, ComparisonResult, Lesson, Difference, MetadataIssue, LessonOrderIssue } from '../types';

/**
 * Compare lessons between hierarchies using alignment identifiers
 */
function compareLessons(
  anchorLessons: Lesson[],
  comparedLessons: Lesson[],
  _anchorHierarchyId: string,
  comparedHierarchyId: string
): {
  differences: Difference[];
  lessonOrderIssues: LessonOrderIssue[];
} {
  const differences: Difference[] = [];
  const lessonOrderIssues: LessonOrderIssue[] = [];

  // Create maps for quick lookup
  const anchorMap = new Map<string, Lesson>();
  anchorLessons.forEach(lesson => {
    anchorMap.set(lesson.id, lesson);
  });

  const comparedMap = new Map<string, Lesson>();
  comparedLessons.forEach(lesson => {
    comparedMap.set(lesson.id, lesson);
  });

  // Find missing lessons in compared hierarchy
  anchorLessons.forEach(anchorLesson => {
    if (!comparedMap.has(anchorLesson.id)) {
      differences.push({
        type: 'missing',
        level: 'lesson',
        path: `Lesson: ${anchorLesson.title}`,
        description: `Lesson "${anchorLesson.title}" is missing in compared hierarchy`,
        severity: 'error',
      });
    } else {
      const comparedLesson = comparedMap.get(anchorLesson.id)!;
      
      // Check for order differences
      if (anchorLesson.order !== comparedLesson.order) {
        lessonOrderIssues.push({
          lessonId: anchorLesson.id,
          lessonTitle: anchorLesson.title,
          expectedOrder: anchorLesson.order,
          actualOrder: comparedLesson.order,
          hierarchyId: comparedHierarchyId,
        });
        
        differences.push({
          type: 'order',
          level: 'lesson',
          path: `Lesson: ${anchorLesson.title}`,
          description: `Lesson order mismatch: expected ${anchorLesson.order}, found ${comparedLesson.order}`,
          severity: 'warning',
        });
      }

      // Check for variant differences
      if (anchorLesson.variant !== comparedLesson.variant) {
        differences.push({
          type: 'mismatch',
          level: 'lesson',
          path: `Lesson: ${anchorLesson.title}`,
          description: `Variant mismatch: anchor has "${anchorLesson.variant || 'Standard'}", compared has "${comparedLesson.variant || 'Standard'}"`,
          severity: 'warning',
        });
      }
    }
  });

  // Find extra lessons in compared hierarchy
  comparedLessons.forEach(comparedLesson => {
    if (!anchorMap.has(comparedLesson.id)) {
      differences.push({
        type: 'extra',
        level: 'lesson',
        path: `Lesson: ${comparedLesson.title}`,
        description: `Extra lesson "${comparedLesson.title}" found in compared hierarchy`,
        severity: 'info',
      });
    }
  });

  return { differences, lessonOrderIssues };
}

/**
 * Compare metadata between hierarchies
 */
function compareMetadata(
  anchor: Hierarchy,
  compared: Hierarchy
): MetadataIssue[] {
  const issues: MetadataIssue[] = [];

  // Compare subject
  if (anchor.subject !== compared.subject) {
    issues.push({
      field: 'Subject',
      hierarchyId: compared.id,
      expectedValue: anchor.subject,
      actualValue: compared.subject,
      description: `Subject mismatch: anchor has "${anchor.subject}", compared has "${compared.subject}"`,
    });
  }

  // Compare implementation model
  if (anchor.implementationModel !== compared.implementationModel) {
    issues.push({
      field: 'Implementation Model',
      hierarchyId: compared.id,
      expectedValue: anchor.implementationModel,
      actualValue: compared.implementationModel,
      description: `Implementation model mismatch: anchor has "${anchor.implementationModel}", compared has "${compared.implementationModel}"`,
    });
  }

  // Compare lesson count
  const anchorLessonCount = anchor.lessons?.length || 0;
  const comparedLessonCount = compared.lessons?.length || 0;
  if (anchorLessonCount !== comparedLessonCount) {
    issues.push({
      field: 'Lesson Count',
      hierarchyId: compared.id,
      expectedValue: anchorLessonCount,
      actualValue: comparedLessonCount,
      description: `Lesson count mismatch: anchor has ${anchorLessonCount} lessons, compared has ${comparedLessonCount} lessons`,
    });
  }

  return issues;
}

/**
 * Generate comparison results for a hierarchy compared to anchor
 */
export function generateComparisonResult(
  anchor: Hierarchy,
  compared: Hierarchy
): ComparisonResult {
  const anchorLessons = anchor.lessons || [];
  const comparedLessons = compared.lessons || [];

  const { differences, lessonOrderIssues } = compareLessons(
    anchorLessons,
    comparedLessons,
    anchor.id,
    compared.id
  );

  const metadataIssues = compareMetadata(anchor, compared);

  return {
    hierarchyId: compared.id,
    hierarchyName: compared.name,
    differences,
    productRuleViolations: [], // Can be enhanced later
    metadataIssues,
    lessonOrderIssues,
  };
}

/**
 * Generate comparison results for multiple hierarchies
 */
export function generateComparisonResults(
  anchor: Hierarchy,
  comparedHierarchies: Hierarchy[]
): ComparisonResult[] {
  return comparedHierarchies.map(compared => 
    generateComparisonResult(anchor, compared)
  );
}

