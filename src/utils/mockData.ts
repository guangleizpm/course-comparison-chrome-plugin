/**
 * Mock data generator for wireframe demonstration
 * Provides sample hierarchies and comparison results
 */

import { Hierarchy, ComparisonResult, Lesson } from '../types';

// Generate 20 lessons for IC (anchor course)
const generateICLessons = (): Lesson[] => {
  const lessonTitles = [
    'Introduction to Variables',
    'Linear Equations Basics',
    'Solving One-Step Equations',
    'Solving Two-Step Equations',
    'Multi-Step Equations',
    'Equations with Fractions',
    'Graphing Linear Equations',
    'Slope and Rate of Change',
    'Writing Linear Equations',
    'Systems of Equations',
    'Inequalities Introduction',
    'Solving Inequalities',
    'Graphing Inequalities',
    'Polynomials Basics',
    'Adding and Subtracting Polynomials',
    'Multiplying Polynomials',
    'Factoring Basics',
    'Factoring Quadratics',
    'Quadratic Equations',
    'Quadratic Formula',
  ];
  
  return lessonTitles.map((title, index) => ({
    id: `ic-lesson-${index + 1}`,
    title,
    order: index + 1,
    variant: 'Standard',
  }));
};

// Generate lessons for CR: 70% same (14 lessons) + 30% new (6 lessons) = 20 total
// Same lessons keep the same base ID for matching, but with CR prefix
// Some lessons are shifted in order to demonstrate order changes
const generateCRLessons = (icLessons: Lesson[]): Lesson[] => {
  // Take 14 lessons from IC (70% of 20) - keep same base ID for matching
  const sameLessons = icLessons.slice(0, 14).map((lesson, index) => ({
    ...lesson,
    id: lesson.id.replace('ic-', 'cr-'), // Keep same base ID pattern for matching
    order: index + 1,
    variant: 'Remedial',
  }));
  
  // Shift some lessons in order to demonstrate order changes
  // Create a reordered array with specific swaps
  const reorderedLessons: Lesson[] = [];
  
  // Reorder: swap some lessons to show order changes
  // Original order: 1,2,3,4,5,6,7,8,9,10,11,12,13,14
  // New order: 1,2,5,4,3,6,9,8,7,10,12,11,13,14
  // This creates order changes for lessons 3,5,7,9,11,12
  
  const orderMap = [1, 2, 5, 4, 3, 6, 9, 8, 7, 10, 12, 11, 13, 14];
  for (let i = 0; i < sameLessons.length; i++) {
    const originalIndex = orderMap[i] - 1; // Convert to 0-based index
    const lesson = { ...sameLessons[originalIndex] };
    lesson.order = i + 1; // New order position
    reorderedLessons.push(lesson);
  }
  
  // Add 6 new CR-specific lessons (these won't match any IC lessons)
  const newCRLessons: Lesson[] = [
    { id: 'cr-new-1', title: 'CR Remedial: Basic Arithmetic Review', order: 15, variant: 'Remedial' },
    { id: 'cr-new-2', title: 'CR Remedial: Number Sense', order: 16, variant: 'Remedial' },
    { id: 'cr-new-3', title: 'CR Remedial: Fraction Operations', order: 17, variant: 'Remedial' },
    { id: 'cr-new-4', title: 'CR Remedial: Decimal Operations', order: 18, variant: 'Remedial' },
    { id: 'cr-new-5', title: 'CR Remedial: Percent Applications', order: 19, variant: 'Remedial' },
    { id: 'cr-new-6', title: 'CR Remedial: Pre-Algebra Review', order: 20, variant: 'Remedial' },
  ];
  
  return [...reorderedLessons, ...newCRLessons];
};

// Generate lessons for Honors: 70% same (14 lessons) + 30% new (6 lessons) = 20 total
// Same lessons keep the same base ID for matching, but with Honors prefix
// Some lessons are shifted in order to demonstrate order changes
const generateHonorsLessons = (icLessons: Lesson[]): Lesson[] => {
  // Take 14 lessons from IC (70% of 20) - keep same base ID for matching
  const sameLessons = icLessons.slice(0, 14).map((lesson, index) => ({
    ...lesson,
    id: lesson.id.replace('ic-', 'honors-'), // Keep same base ID pattern for matching
    order: index + 1,
    variant: 'Advanced',
  }));
  
  // Shift some lessons in order to demonstrate order changes
  // Create a reordered array with specific moves
  // Original order: 1,2,3,4,5,6,7,8,9,10,11,12,13,14
  // New order: 1,4,3,2,5,8,7,6,9,10,12,11,13,14
  // This creates order changes for lessons 2,4,6,8,11,12
  
  const reorderedLessons: Lesson[] = [];
  const orderMap = [1, 4, 3, 2, 5, 8, 7, 6, 9, 10, 12, 11, 13, 14];
  for (let i = 0; i < sameLessons.length; i++) {
    const originalIndex = orderMap[i] - 1; // Convert to 0-based index
    const lesson = { ...sameLessons[originalIndex] };
    lesson.order = i + 1; // New order position
    reorderedLessons.push(lesson);
  }
  
  // Add 6 new Honors-specific lessons (these won't match any IC lessons)
  const newHonorsLessons: Lesson[] = [
    { id: 'honors-new-1', title: 'Honors: Advanced Problem Solving', order: 15, variant: 'Advanced' },
    { id: 'honors-new-2', title: 'Honors: Complex Systems', order: 16, variant: 'Advanced' },
    { id: 'honors-new-3', title: 'Honors: Advanced Factoring', order: 17, variant: 'Advanced' },
    { id: 'honors-new-4', title: 'Honors: Rational Expressions', order: 18, variant: 'Advanced' },
    { id: 'honors-new-5', title: 'Honors: Radical Equations', order: 19, variant: 'Advanced' },
    { id: 'honors-new-6', title: 'Honors: Introduction to Functions', order: 20, variant: 'Advanced' },
  ];
  
  return [...reorderedLessons, ...newHonorsLessons];
};

const icLessons = generateICLessons();
const crLessons = generateCRLessons(icLessons);
const honorsLessons = generateHonorsLessons(icLessons);

export const mockHierarchies: Hierarchy[] = [
  {
    id: 'h1',
    courseId: 'ALG1-TX',
    name: 'Algebra I - IC',
    type: 'course',
    implementationModel: 'IC',
    subject: 'Math',
    versions: [
      { versionId: 'v3', versionNumber: '3.0', createdAt: '2024-01-15', isLatest: true },
      { versionId: 'v2', versionNumber: '2.1', createdAt: '2023-12-01', isLatest: false },
      { versionId: 'v1', versionNumber: '1.0', createdAt: '2023-10-01', isLatest: false },
    ],
    currentVersion: { versionId: 'v3', versionNumber: '3.0', createdAt: '2024-01-15', isLatest: true },
    lessons: icLessons,
  },
  {
    id: 'h2',
    courseId: 'ALG1-TX',
    name: 'Algebra I - CR',
    type: 'course',
    implementationModel: 'CR',
    subject: 'Math',
    versions: [
      { versionId: 'v3', versionNumber: '3.0', createdAt: '2024-01-15', isLatest: true },
      { versionId: 'v2', versionNumber: '2.1', createdAt: '2023-12-01', isLatest: false },
    ],
    currentVersion: { versionId: 'v3', versionNumber: '3.0', createdAt: '2024-01-15', isLatest: true },
    lessons: crLessons,
  },
  {
    id: 'h3',
    courseId: 'ALG1-TX',
    name: 'Algebra I - Honors',
    type: 'course',
    implementationModel: 'Honors',
    subject: 'Math',
    versions: [
      { versionId: 'v3', versionNumber: '3.0', createdAt: '2024-01-15', isLatest: true },
      { versionId: 'v2', versionNumber: '2.0', createdAt: '2023-11-15', isLatest: false },
    ],
    currentVersion: { versionId: 'v3', versionNumber: '3.0', createdAt: '2024-01-15', isLatest: true },
    lessons: honorsLessons,
  },
  {
    id: 'h4',
    courseId: 'SCI1-CA',
    name: 'Science I - IC',
    type: 'course',
    implementationModel: 'IC',
    subject: 'Science',
    versions: [
      { versionId: 'v2', versionNumber: '2.0', createdAt: '2024-01-10', isLatest: true },
    ],
    currentVersion: { versionId: 'v2', versionNumber: '2.0', createdAt: '2024-01-10', isLatest: true },
  },
];

export const mockComparisonResults: ComparisonResult[] = [
  {
    hierarchyId: 'h1',
    hierarchyName: 'Algebra I - IC',
    differences: [
      {
        type: 'mismatch',
        level: 'lesson',
        path: 'Semester 1 > Unit 2 > Lesson 5',
        description: 'Lesson variant mismatch: IC has "Standard" but CR has "Remedial"',
        severity: 'warning',
      },
      {
        type: 'missing',
        level: 'lesson',
        path: 'Semester 2 > Unit 4',
        description: 'Missing lesson "Advanced Problem Solving" in CR version',
        severity: 'error',
      },
    ],
    productRuleViolations: [
      {
        ruleId: 'MATH-IC-001',
        ruleName: 'Short Writings Requirement',
        ruleDescription: 'Math IC and Honors: 2 short writings per semester',
        hierarchyId: 'h1',
        hierarchyName: 'Algebra I - IC',
        severity: 'error',
        details: 'Semester 1 has only 1 short writing (expected: 2)',
      },
    ],
    metadataIssues: [
      {
        field: 'duration',
        hierarchyId: 'h1',
        expectedValue: 180,
        actualValue: 175,
        description: 'Course duration mismatch',
      },
    ],
    lessonOrderIssues: [
      {
        lessonId: 'l15',
        lessonTitle: 'Quadratic Equations',
        expectedOrder: 15,
        actualOrder: 16,
        hierarchyId: 'h1',
      },
    ],
  },
  {
    hierarchyId: 'h2',
    hierarchyName: 'Algebra I - CR',
    differences: [
      {
        type: 'extra',
        level: 'lesson',
        path: 'Semester 1 > Unit 1',
        description: 'Extra lesson "Teacher Graded Assignment" found (should be removed in CR)',
        severity: 'error',
      },
    ],
    productRuleViolations: [
      {
        ruleId: 'MATH-CR-001',
        ruleName: 'Teacher Graded Content Removal',
        ruleDescription: 'CR only: all teacher graded content must be removed',
        hierarchyId: 'h2',
        hierarchyName: 'Algebra I - CR',
        severity: 'error',
        details: 'Found 3 teacher graded assignments that should be removed',
      },
    ],
    metadataIssues: [],
    lessonOrderIssues: [],
  },
];

