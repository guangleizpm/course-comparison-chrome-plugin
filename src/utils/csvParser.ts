/**
 * CSV Parser Utility
 * Parses course hierarchy CSV files and converts them to Hierarchy objects
 * Handles client-side CSV parsing without backend services
 */

import { Hierarchy, Lesson, HierarchyVersion, ImplementationModel } from '../types';

export interface CSVRow {
  hierarchyId: string;
  hierarchyName: string;
  splitTitle: string;
  unitTitle: string;
  edgeExLessonId: string;
  edgeExLessonTitle: string;
  alignmentIdentifier: string;
  variantIdentifier: string;
  subject: string;
  title: string;
  sourceOrder?: string;
  [key: string]: string | undefined;
}

/**
 * Parse CSV file content into rows
 */
export function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip empty lines and header rows
  // The CSV has 2-3 header rows, we need to find the actual data header
  let headerIndex = -1;
  let headerRow: string[] = [];
  
  // Find the header row (contains "Hierarchy ID")
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].includes('Hierarchy ID')) {
      headerIndex = i;
      headerRow = parseCSVLine(lines[i]);
      break;
    }
  }
  
  if (headerIndex === -1) {
    throw new Error('Could not find CSV header row');
  }
  
  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v.trim())) continue;
    
    const row: any = {};
    headerRow.forEach((header, index) => {
      const cleanHeader = header.trim();
      const value = values[index]?.trim() || '';
      
      // Map headers to our interface
      switch (cleanHeader) {
        case 'Hierarchy ID':
          row.hierarchyId = value;
          break;
        case 'Hierarchy Name':
          row.hierarchyName = value;
          break;
        case 'Split Title':
          row.splitTitle = value;
          break;
        case 'Unit Title':
          row.unitTitle = value;
          break;
        case 'EdgeEx Lesson ID':
          row.edgeExLessonId = value;
          break;
        case 'EdgeEx Lesson Title':
          row.edgeExLessonTitle = value;
          break;
        case 'Alignment Identifier':
          row.alignmentIdentifier = value;
          break;
        case 'Variant Identifier':
          row.variantIdentifier = value;
          break;
        case 'Subject':
          row.subject = value;
          break;
        case 'Title':
          row.title = value;
          break;
        case 'Source Order':
          row.sourceOrder = value;
          break;
        default:
          row[cleanHeader] = value;
      }
    });
    
    // Only add rows with hierarchy ID
    if (row.hierarchyId) {
      rows.push(row as CSVRow);
    }
  }
  
  return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current);
  
  return result;
}

/**
 * Convert CSV rows to Hierarchy object
 */
export function csvRowsToHierarchy(rows: CSVRow[]): Hierarchy {
  if (rows.length === 0) {
    throw new Error('No data rows found in CSV');
  }
  
  const firstRow = rows[0];
  const hierarchyId = firstRow.hierarchyId;
  const hierarchyName = firstRow.hierarchyName;
  const subject = firstRow.subject || 'Not Set Yet';
  
  // Determine implementation model from hierarchy name
  let implementationModel: ImplementationModel | undefined;
  const nameUpper = hierarchyName.toUpperCase();
  if (nameUpper.includes(' IC') || nameUpper.endsWith(' IC')) {
    implementationModel = 'IC';
  } else if (nameUpper.includes(' CR') || nameUpper.endsWith(' CR')) {
    implementationModel = 'CR';
  } else if (nameUpper.includes(' HON') || nameUpper.includes(' HONORS') || nameUpper.endsWith(' HON')) {
    implementationModel = 'Honors';
  }
  
  // Extract course ID from hierarchy name or use hierarchy ID
  const courseIdMatch = hierarchyName.match(/([A-Z]+-\w+)/);
  const courseId = courseIdMatch ? courseIdMatch[1] : undefined;
  
  // Convert rows to lessons
  // Group by unit/semester to maintain proper ordering
  const lessonsMap = new Map<string, Lesson>();
  
  rows.forEach((row, index) => {
    // Use Alignment Identifier as primary ID for matching across hierarchies
    // Fall back to Variant Identifier or EdgeEx Lesson ID
    const lessonId = row.alignmentIdentifier || row.variantIdentifier || row.edgeExLessonId;
    
    // Use Title column (column 11) or EdgeEx Lesson Title
    const lessonTitle = row.title || row.edgeExLessonTitle || `Lesson ${index + 1}`;
    
    // Try to parse order from Source Order, otherwise use index
    let order = index + 1;
    if (row.sourceOrder) {
      const parsedOrder = parseInt(row.sourceOrder, 10);
      if (!isNaN(parsedOrder)) {
        order = parsedOrder;
      }
    }
    
    // If lesson ID already exists, keep the one with lower order (first occurrence)
    if (!lessonsMap.has(lessonId)) {
    
      const lesson: Lesson = {
        id: lessonId,
        title: lessonTitle,
        order: order,
        variant: row.variantIdentifier || undefined,
      };
      
      // Add metadata if the type supports it
      if ('metadata' in lesson) {
        (lesson as any).metadata = {
          unitTitle: row.unitTitle,
          splitTitle: row.splitTitle,
          edgeExLessonId: row.edgeExLessonId,
          alignmentIdentifier: row.alignmentIdentifier,
          variantIdentifier: row.variantIdentifier,
        };
      }
      
      lessonsMap.set(lessonId, lesson);
    }
  });
  
  // Convert map to array and sort by order
  const lessons = Array.from(lessonsMap.values());
  lessons.sort((a, b) => a.order - b.order);
  
  // Re-number orders sequentially to ensure no gaps
  lessons.forEach((lesson, index) => {
    lesson.order = index + 1;
  });
  
  // Create version info
  const version: HierarchyVersion = {
    versionId: `${hierarchyId}-v1`,
    versionNumber: '1.0',
    createdAt: new Date().toISOString(),
    isLatest: true,
  };
  
  return {
    id: hierarchyId,
    courseId,
    name: hierarchyName,
    type: 'course',
    implementationModel,
    subject,
    versions: [version],
    currentVersion: version,
    lessons,
  };
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}

/**
 * Process uploaded CSV file
 */
export async function processCSVFile(file: File): Promise<Hierarchy> {
  const content = await readFileAsText(file);
  const rows = parseCSV(content);
  return csvRowsToHierarchy(rows);
}

