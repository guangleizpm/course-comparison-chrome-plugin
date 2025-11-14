# Course Hierarchy Comparison - Chrome Extension

Chrome extension with side panel for comparing course hierarchies (IC, CR, Honors) in an EdTech Course Management System. The extension provides an expandable side panel interface for easy access while browsing.

## Features

- **Hierarchy Selection**: Select 2-3 hierarchies from the library with version dropdown
- **Side-by-Side Comparison**: Compare hierarchies with visual difference highlighting
- **Multiple View Modes**:
  - Differences: Structural differences between hierarchies
  - Metadata Issues: Consistency checks for metadata
  - Lesson Order: Verify lesson ordering consistency
  - Product Rules: Subject-specific rule compliance validation
- **Product Rules Validation**: 
  - Science: Virtual labs limit, project requirements, teacher-graded content removal
  - Math: Short writings requirement, teacher-graded content removal
- **Interactive UI**: Search, filter, and navigate hierarchies across pagination

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
4. All functionality from the original website is available in the side panel

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
│   │   ├── HierarchySelector.tsx    # Hierarchy selection with version dropdown
│   │   ├── ComparisonView.tsx        # Main comparison interface
│   │   ├── ComparisonResults.tsx     # Difference and issue display
│   │   └── ProductRulesPanel.tsx     # Product rules validation
│   ├── types/
│   │   ├── index.ts                  # TypeScript type definitions
│   │   └── chrome.d.ts               # Chrome extension API types
│   ├── utils/
│   │   └── mockData.ts               # Mock data for wireframe
│   ├── App.tsx                       # Main application component (with expand/collapse)
│   └── main.tsx                      # Application entry point
└── dist/                       # Build output (created after npm run build:extension)
```

## Key Components

### HierarchySelector
- Search and select hierarchies
- Version dropdown (defaults to latest)
- Supports all hierarchy types (courses, assessment bundles, TIM pathways, etc.)

### ComparisonView
- Tabbed interface for different comparison views
- Summary statistics
- Supports 2-way and 3-way comparisons

### ComparisonResults
- Visual difference highlighting
- Severity indicators (error, warning, info)
- Organized by hierarchy

### ProductRulesPanel
- Subject-specific rule validation
- Violation details
- Compliance status per hierarchy

## Chrome Extension Features

- **Side Panel Integration**: Opens as a side panel in Chrome for easy access
- **Expandable/Collapsible**: Toggle between compact and expanded views using the header button
- **Responsive Layout**: Automatically adapts to side panel width constraints
- **Persistent State**: Maintains selection state while browsing

## Notes

- The extension requires Chrome 114+ for side panel support
- Icons need to be added to `public/icons/` directory (icon16.png, icon48.png, icon128.png)
- The side panel width is managed by Chrome, but the content adapts to expanded/collapsed states

