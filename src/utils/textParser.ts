/**
 * Text Parser Utility
 * Parses tab-separated text pasted from clipboard and converts to Hierarchy objects
 * Handles hierarchical course data with Title, Type, and ID columns
 * Builds proper hierarchy: Split -> Unit -> Lesson -> Activity/Quiz
 * Also handles: Split -> Exam (Exam is child of Split, same level as Unit)
 * Only EdgeEx Lessons, Test (Type = Test), and Exam are top-level lessons; Activities/Quizzes are stored as children
 */

import { Hierarchy, Lesson, HierarchyVersion, ImplementationModel } from '../types';

export interface TextRow {
  title: string;
  type: string;
  id: string;
}

interface HierarchyNode {
  title: string;
  type: string;
  id: string;
  children: HierarchyNode[];
  parent?: HierarchyNode;
}

/**
 * Parse tab-separated text content into rows
 */
export function parseText(content: string): TextRow[] {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('No data found in pasted text');
  }
  
  // Check if first line is a header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('title') && firstLine.includes('type') && firstLine.includes('id');
  
  const startIndex = hasHeader ? 1 : 0;
  const rows: TextRow[] = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by tab (preferred) or multiple spaces (fallback)
    let parts: string[];
    if (line.includes('\t')) {
      // Tab-separated
      parts = line.split(/\t+/).map(p => p.trim());
    } else {
      // Space-separated (try to split on 2+ spaces)
      parts = line.split(/\s{2,}/).map(p => p.trim());
    }
    
    // Filter out empty parts
    parts = parts.filter(p => p);
    
    if (parts.length >= 3) {
      rows.push({
        title: parts[0],
        type: parts[1],
        id: parts[2],
      });
    } else if (parts.length === 2) {
      // Handle cases where ID might be missing - use a generated ID
      rows.push({
        title: parts[0],
        type: parts[1],
        id: `${parts[0]}-${parts[1]}-${rows.length}`,
      });
    } else if (parts.length === 1 && parts[0]) {
      // Single column - treat as title only
      rows.push({
        title: parts[0],
        type: 'Unknown',
        id: `item-${rows.length}`,
      });
    }
  }
  
  return rows;
}

/**
 * Build hierarchical tree structure from flat rows
 */
function buildHierarchyTree(rows: TextRow[]): HierarchyNode[] {
  const rootNodes: HierarchyNode[] = [];
  const nodeStack: HierarchyNode[] = [];
  
  rows.forEach((row) => {
    const node: HierarchyNode = {
      title: row.title.trim(),
      type: row.type.trim(),
      id: row.id.trim(),
      children: [],
    };
    
    // Determine hierarchy level
    if (node.type === 'Split') {
      // Split is a root node
      rootNodes.push(node);
      nodeStack.length = 0; // Clear stack when new split starts
      nodeStack.push(node);
    } else if (node.type === 'Unit') {
      // Unit is child of current Split
      const parent = nodeStack.find(n => n.type === 'Split');
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
        // Remove any existing Unit and Lesson from stack (new unit means new lesson context)
        // Keep only Split, then add new Unit
        const splitNode = nodeStack.find(n => n.type === 'Split');
        nodeStack.length = 0;
        if (splitNode) nodeStack.push(splitNode);
        nodeStack.push(node);
      } else {
        // No parent Split, treat as root
        rootNodes.push(node);
        nodeStack.length = 0;
        nodeStack.push(node);
      }
    } else if (node.type === 'EdgeEx Lesson') {
      // Lesson is child of current Unit (or Split if no Unit)
      let parent = nodeStack.find(n => n.type === 'Unit');
      if (!parent) {
        parent = nodeStack.find(n => n.type === 'Split');
      }
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
        // Remove any existing Lesson from stack, but keep Unit/Split
        const lessonIndex = nodeStack.findIndex(n => n.type === 'EdgeEx Lesson');
        if (lessonIndex !== -1) {
          nodeStack.splice(lessonIndex, 1);
        }
        nodeStack.push(node);
      } else {
        // No parent, treat as root
        rootNodes.push(node);
        nodeStack.length = 0;
        nodeStack.push(node);
      }
    } else if (node.type === 'Test') {
      // Test (Type = Test) is child of current Unit (or Split if no Unit)
      // This is different from Quiz which is a child of Test
      let parent = nodeStack.find(n => n.type === 'Unit');
      if (!parent) {
        parent = nodeStack.find(n => n.type === 'Split');
      }
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
        // Add Test to stack so Quiz can be its child
        const testIndex = nodeStack.findIndex(n => n.type === 'Test');
        if (testIndex !== -1) {
          nodeStack.splice(testIndex, 1);
        }
        nodeStack.push(node);
      } else {
        // No parent, treat as root
        rootNodes.push(node);
        nodeStack.length = 0;
        nodeStack.push(node);
      }
    } else if (node.type === 'Exam') {
      // Exam is child of Split (same level as Unit)
      const parent = nodeStack.find(n => n.type === 'Split');
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
        // Don't add to stack, Exam is a leaf node but will be extracted as a top-level lesson
      } else {
        // No parent Split, treat as root
        rootNodes.push(node);
      }
    } else if (
      node.type === 'Activity' ||
      node.type === 'Quiz'
    ) {
      // Activity/Quiz can be child of EdgeEx Lesson or Test
      // First try to find Test parent (for Quiz children of Test)
      let parent = nodeStack.find(n => n.type === 'Test');
      // If no Test parent, try EdgeEx Lesson
      if (!parent) {
        parent = nodeStack.find(n => n.type === 'EdgeEx Lesson');
      }
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
        // Don't add to stack, these are leaf nodes
      } else {
        // No parent, try to attach to Unit as fallback
        const unitParent = nodeStack.find(n => n.type === 'Unit');
        if (unitParent) {
          unitParent.children.push(node);
          node.parent = unitParent;
        } else {
          rootNodes.push(node);
        }
      }
    } else {
      // Unknown type - try to attach to current parent
      const parent = nodeStack[nodeStack.length - 1];
      if (parent) {
        parent.children.push(node);
        node.parent = parent;
      } else {
        rootNodes.push(node);
      }
    }
  });
  
  return rootNodes;
}

/**
 * Convert text rows to Hierarchy object
 * Builds hierarchical structure and creates lessons only for EdgeEx Lessons
 */
export function textRowsToHierarchy(rows: TextRow[], hierarchyName: string = 'Pasted Course'): Hierarchy {
  if (rows.length === 0) {
    throw new Error('No data rows found in pasted text');
  }
  
  // Build hierarchical tree
  const tree = buildHierarchyTree(rows);
  
  // Find the first Split to determine hierarchy name
  let name = hierarchyName;
  if (!name || name === 'Pasted Course') {
    const firstSplit = rows.find(r => r.type === 'Split');
    if (firstSplit) {
      // If the split is a semester (Semester A, Semester B), use a generic name
      if (firstSplit.title.toLowerCase().includes('semester')) {
        name = 'Pasted Course';
      } else {
        name = firstSplit.title;
      }
    } else {
      name = 'Pasted Course';
    }
  }
  
  // Determine implementation model from name
  let implementationModel: ImplementationModel | undefined;
  const nameUpper = name.toUpperCase();
  if (nameUpper.includes(' IC') || nameUpper.endsWith(' IC')) {
    implementationModel = 'IC';
  } else if (nameUpper.includes(' CR') || nameUpper.endsWith(' CR')) {
    implementationModel = 'CR';
  } else if (nameUpper.includes(' HON') || nameUpper.includes(' HONORS') || nameUpper.endsWith(' HON')) {
    implementationModel = 'Honors';
  }
  
  // Extract course ID from name or use first split ID
  const courseIdMatch = name.match(/([A-Z]+-\w+)/);
  const courseId = courseIdMatch ? courseIdMatch[1] : undefined;
  const firstSplit = rows.find(r => r.type === 'Split');
  // Use a unique hierarchy ID - combine first split ID with timestamp to ensure uniqueness
  // This prevents conflicts when pasting the same data into multiple courses
  const baseId = firstSplit?.id || rows[0]?.id || '';
  const hierarchyId = baseId ? `${baseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : `hierarchy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Extract lessons from tree (EdgeEx Lessons, Test (Type = Test), and Exam become top-level lessons)
  const lessons: Lesson[] = [];
  let order = 1;
  
  // Recursively extract lessons from tree
  function extractLessons(nodes: HierarchyNode[], currentSplit?: string, currentUnit?: string) {
    nodes.forEach((node) => {
      if (node.type === 'Split') {
        // Recurse into split children
        extractLessons(node.children, node.title, currentUnit);
      } else if (node.type === 'Unit') {
        // Recurse into unit children
        extractLessons(node.children, currentSplit, node.title);
      } else if (node.type === 'EdgeEx Lesson' || node.type === 'Test' || node.type === 'Exam') {
        // This is a lesson, test, or exam - create Lesson object
        // Collect all children (Activities, Quizzes, etc.)
        // For Test nodes, collect Quiz children
        // For Exam nodes, they have no children (they're leaf nodes at Split level)
        const children = node.children.map(child => ({
          id: child.id,
          title: child.title,
          type: child.type,
        }));
        
        const lesson: Lesson = {
          id: node.id, // Use ID from column 3 as unique identifier
          title: node.title,
          order: order++,
          variant: node.type === 'Test' ? 'Test' : node.type === 'Exam' ? 'Exam' : undefined,
          metadata: {
            type: node.type,
            unitTitle: currentUnit || '', // Exam has no Unit (it's child of Split)
            splitTitle: currentSplit || '',
            originalId: node.id,
            children: children, // Store Activities/Quizzes/Test children as children (empty for Exam)
            parentUnit: currentUnit, // Exam will have empty parentUnit
            parentSplit: currentSplit,
          },
        };
        
        lessons.push(lesson);
      } else {
        // For other types, recurse into children (in case there are nested structures)
        extractLessons(node.children, currentSplit, currentUnit);
      }
    });
  }
  
  extractLessons(tree);
  
  // Log for debugging
  if (lessons.length === 0) {
    console.warn('No lessons extracted from pasted text. Tree structure:', tree);
    console.warn('Rows with EdgeEx Lesson type:', rows.filter(r => r.type === 'EdgeEx Lesson').length);
  }
  
  // Create version info
  const version: HierarchyVersion = {
    versionId: `${hierarchyId}-v1`,
    versionNumber: '1.0',
    createdAt: new Date().toISOString(),
    isLatest: true,
  };
  
  const hierarchy: Hierarchy = {
    id: hierarchyId,
    courseId,
    name: name,
    type: 'course',
    implementationModel,
    subject: 'Not Set Yet', // Default subject, can be updated if available
    versions: [version],
    currentVersion: version,
    lessons,
  };
  
  console.log(`Created hierarchy: ${hierarchy.name} (ID: ${hierarchy.id}) with ${lessons.length} lessons`);
  
  return hierarchy;
}

/**
 * Process pasted text content
 */
export function processTextContent(content: string, hierarchyName?: string): Hierarchy {
  const rows = parseText(content);
  return textRowsToHierarchy(rows, hierarchyName);
}
