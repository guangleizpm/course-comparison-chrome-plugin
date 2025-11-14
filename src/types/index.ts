/**
 * Type definitions for the course hierarchy comparison system
 * Defines data structures for hierarchies, comparisons, and validation results
 */

export type ImplementationModel = 'IC' | 'CR' | 'Honors';

export type HierarchyType = 
  | 'course' 
  | 'assessment-bundle' 
  | 'TIM-pathway' 
  | 'TIM-bundle' 
  | 'hierarchy-lesson';

export interface HierarchyVersion {
  versionId: string;
  versionNumber: string;
  createdAt: string;
  isLatest: boolean;
}

export interface Hierarchy {
  id: string;
  courseId?: string;
  name: string;
  type: HierarchyType;
  implementationModel?: ImplementationModel;
  subject?: string;
  versions: HierarchyVersion[];
  currentVersion?: HierarchyVersion;
  lessons?: Lesson[]; // Lessons for the current version
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  variant?: string;
  metadata?: Record<string, any>;
}

export interface ComparisonResult {
  hierarchyId: string;
  hierarchyName: string;
  differences: Difference[];
  productRuleViolations: ProductRuleViolation[];
  metadataIssues: MetadataIssue[];
  lessonOrderIssues: LessonOrderIssue[];
}

export interface Difference {
  type: 'missing' | 'extra' | 'mismatch' | 'order';
  level: 'course' | 'semester' | 'unit' | 'lesson';
  path: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ProductRuleViolation {
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  hierarchyId: string;
  hierarchyName: string;
  severity: 'error' | 'warning';
  details: string;
}

export interface MetadataIssue {
  field: string;
  hierarchyId: string;
  expectedValue?: any;
  actualValue?: any;
  description: string;
}

export interface LessonOrderIssue {
  lessonId: string;
  lessonTitle: string;
  expectedOrder: number;
  actualOrder: number;
  hierarchyId: string;
}

export interface LessonComparison {
  anchorLesson: Lesson | null;
  comparedLesson: Lesson | null;
  status: 'same' | 'removed' | 'added' | 'order-changed';
  anchorOrder: number;
  comparedOrder: number | null;
}

