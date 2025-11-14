# Course Hierarchy Comparison - Chrome Extension

Chrome extension with side panel for comparing course hierarchies (IC, CR, Honors) in an EdTech Course Management System. The extension provides an expandable side panel interface for easy access while browsing. **All processing happens client-side - no backend services required!**

## Features

### Input Methods
- **CSV File Upload**: Upload 2-3 CSV files containing course lesson metadata
- **Text Paste Input**: Paste tab-separated text data directly from clipboard
- **Dual Input Modes**: Toggle between upload and paste modes seamlessly

### Comparison Capabilities
- **Side-by-Side Comparison**: Compare hierarchies with visual difference highlighting
- **Lesson Comparison**: 
  - Match lessons using Alignment Identifier
  - Detect missing, extra, and reordered lessons
  - Compare lesson variants
  - **Compare lesson children** (Activities, Quizzes, etc.)
- **Metadata Comparison**: 
  - Subject consistency checks
  - Implementation model verification
  - Lesson count differences
- **Order Analysis**: Verify lesson ordering consistency across hierarchies
- **Multiple View Modes**:
  - Metadata Issues: Consistency checks for metadata
  - Lesson Comparison: Detailed lesson-by-lesson comparison
- **Product Rules Validation**: 
  - Science: Virtual labs limit, project requirements, teacher-graded content removal
  - Math: Short writings requirement, teacher-graded content removal

### User Experience
- **Expandable/Collapsible Side Panel**: Toggle between compact and expanded views
- **Real-time Processing**: Instant comparison results as files are uploaded
- **Auto Anchor Selection**: First uploaded course automatically selected as anchor
- **Visual Feedback**: Processing indicators, error messages, and success states

## Use Cases

1. **Course Builders**: Compare 2 hierarchies when creating course variants
2. **Publishers**: Compare 3 hierarchies (IC, CR, Honors) to ensure compliance

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Build the Chrome extension
npm run build:extension
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension icon will appear in your Chrome toolbar

### Using the Extension

1. Click the extension icon in the Chrome toolbar to open the side panel
2. The side panel will appear on the right side of your browser
3. Use the expand/collapse button (→/←) in the header to toggle between compact and expanded views

#### Upload Mode (CSV Files)

1. Select "📁 Upload CSV" mode
2. Click "Upload CSV File" for Course 1, Course 2, and optionally Course 3
3. Select your CSV files containing course lesson metadata
4. The extension automatically:
   - Parses the CSV files client-side
   - Extracts hierarchy information and lessons
   - Generates comparison results
   - Selects the first course as anchor (you can change this)

#### Paste Mode (Text Input)

1. Select "📋 Paste Text" mode
2. Paste tab-separated text data into the text areas for IC, CR, and Honors courses
3. Click "Process Text" to parse and compare
4. The extension automatically processes the pasted data and generates comparisons

#### Viewing Results

- Select an anchor course from the uploaded/pasted courses
- View comparison results in the comparison section
- Switch between "Metadata Issues" and "Lesson Comparison" tabs
- Review differences, order issues, and metadata mismatches

### Development

```bash
# Run development server (for testing standalone)
npm run dev

# Build for production
npm run build:extension

# Lint code
npm run lint
```

## Project Structure

```
├── manifest.json              # Chrome extension manifest
├── public/
│   ├── sidepanel.html        # Side panel HTML entry point
│   ├── background.js         # Service worker for extension lifecycle
│   └── icons/                # Extension icons (add your icons here)
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx           # CSV file upload component
│   │   ├── PasteInput.tsx           # Text paste input component
│   │   ├── ComparisonView.tsx       # Main comparison interface
│   │   ├── ComparisonResults.tsx    # Difference and issue display
│   │   ├── LessonComparisonView.tsx # Lesson-by-lesson comparison
│   │   └── ProductRulesPanel.tsx    # Product rules validation
│   ├── types/
│   │   ├── index.ts                 # TypeScript type definitions
│   │   └── chrome.d.ts              # Chrome extension API types
│   ├── utils/
│   │   ├── csvParser.ts             # CSV file parsing utility
│   │   ├── textParser.ts            # Text paste parsing utility
│   │   ├── comparisonEngine.ts      # Client-side comparison engine
│   │   └── mockData.ts              # Mock data (legacy, for reference)
│   ├── App.tsx                      # Main application component
│   └── main.tsx                     # Application entry point
└── dist/                       # Build output (created after npm run build:extension)
```

## Key Components

### FileUpload
- CSV file upload with drag-and-drop support
- Real-time file processing
- Visual feedback for processing state
- File removal capability
- Displays uploaded file information

### PasteInput
- Text paste input for tab-separated data
- Auto-processing on paste
- Manual process button
- Clear functionality
- Supports IC, CR, and Honors course labels

### CSV Parser (`csvParser.ts`)
- Client-side CSV parsing
- Handles quoted values and multiple header rows
- Extracts hierarchy metadata (ID, name, subject, implementation model)
- Converts CSV rows to Lesson objects
- Uses Alignment Identifier for lesson matching
- Preserves lesson order and metadata

### Text Parser (`textParser.ts`)
- Parses tab-separated text input
- Builds hierarchy tree structure
- Handles nested course/unit/lesson relationships
- Converts text data to Hierarchy objects

### Comparison Engine (`comparisonEngine.ts`)
- **Client-side comparison** - no backend required
- Compares lessons using Alignment Identifier
- Detects missing, extra, and reordered lessons
- Compares lesson variants
- **Compares lesson children** (Activities, Quizzes within lessons)
- Metadata comparison (subject, implementation model, lesson count)
- Generates comprehensive comparison results

### ComparisonView
- Tabbed interface for different comparison views
- Metadata Issues tab
- Lesson Comparison tab
- Summary statistics
- Supports 2-way and 3-way comparisons

### ComparisonResults
- Visual difference highlighting
- Severity indicators (error, warning, info)
- Organized by hierarchy
- Lesson order issues display

### LessonComparisonView
- Side-by-side lesson comparison
- Matches lessons by Alignment Identifier
- Shows lesson status (same, removed, added, order-changed)
- Displays lesson children differences

## Chrome Extension Features

- **Side Panel Integration**: Opens as a side panel in Chrome for easy access
- **Expandable/Collapsible**: Toggle between compact and expanded views using the header button
- **Responsive Layout**: Automatically adapts to side panel width constraints
- **Client-Side Processing**: All parsing and comparison happens in the browser - no backend needed
- **Real-Time Updates**: Comparison results update automatically as files are uploaded

## CSV File Format

The extension expects CSV files with the following structure:

- **Header Row**: Must contain "Hierarchy ID" column
- **Required Columns**:
  - `Hierarchy ID`: Unique identifier for the course hierarchy
  - `Hierarchy Name`: Name of the course (e.g., "AZ-Integrated Science I IC")
  - `Subject`: Subject area (e.g., "Science", "Math")
  - `Alignment Identifier`: Used for matching lessons across hierarchies
  - `Variant Identifier`: Lesson variant information
  - `Title` or `EdgeEx Lesson Title`: Lesson title
  - `Source Order`: Optional lesson order number

The parser automatically:
- Detects the header row (searches for "Hierarchy ID")
- Handles quoted values and special characters
- Extracts implementation model from hierarchy name (IC, CR, HON/Honors)
- Groups lessons and maintains proper ordering

## Text Paste Format

When using paste mode, provide tab-separated text with:
- **Title**: Lesson or unit title
- **Type**: Type of item (Course, Unit, Lesson, Activity, Quiz, etc.)
- **ID**: Unique identifier for matching

The parser builds a hierarchical structure from the pasted data.

## Technical Details

### Client-Side Processing
- **No Backend Required**: All CSV parsing and comparison happens in the browser
- **Privacy**: Your data never leaves your computer
- **Performance**: Fast processing using Web APIs (FileReader, etc.)

### Lesson Matching
- Lessons are matched using **Alignment Identifier** from the CSV
- Falls back to Variant Identifier or EdgeEx Lesson ID if Alignment Identifier is missing
- Supports matching across different implementation models (IC, CR, Honors)

### Comparison Logic
- **Missing Lessons**: Detected when anchor has a lesson that compared hierarchy doesn't
- **Extra Lessons**: Detected when compared hierarchy has lessons not in anchor
- **Order Changes**: Detected when lesson order differs between hierarchies
- **Variant Differences**: Detected when lesson variants don't match
- **Children Comparison**: Compares Activities and Quizzes within matching lessons

## Notes

- The extension requires Chrome 114+ for side panel support
- Icons need to be added to `public/icons/` directory (icon16.png, icon48.png, icon128.png)
- The side panel width is managed by Chrome, but the content adapts to expanded/collapsed states
- CSV files should follow the format exported from your course management system
- All processing is done client-side - no data is sent to external servers

