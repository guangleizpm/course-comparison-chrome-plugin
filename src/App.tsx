/**
 * Main App Component
 * Course Hierarchy Comparison Wireframe
 * Provides interactive interface for comparing course hierarchies (IC, CR, Honors)
 * Adapted for Chrome Extension side panel with expand/collapse functionality
 * Supports CSV file uploads for course data
 */

import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ComparisonView } from './components/ComparisonView';
import { Hierarchy, ComparisonResult } from './types';
import { generateComparisonResults } from './utils/comparisonEngine';
import './App.css';

function App() {
  const [uploadedHierarchies, setUploadedHierarchies] = useState<Array<Hierarchy | null>>([null, null, null]);
  const [anchorHierarchyId, setAnchorHierarchyId] = useState<string | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update CSS variable for expand/collapse state
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--panel-expanded',
      isExpanded ? '1' : '0'
    );
  }, [isExpanded]);

  // Generate comparison results when hierarchies change
  useEffect(() => {
    const validHierarchies = uploadedHierarchies.filter((h): h is Hierarchy => h !== null);
    
    if (validHierarchies.length >= 2 && anchorHierarchyId) {
      const anchor = validHierarchies.find(h => h.id === anchorHierarchyId);
      if (anchor) {
        const compared = validHierarchies.filter(h => h.id !== anchorHierarchyId);
        const results = generateComparisonResults(anchor, compared);
        setComparisonResults(results);
      } else {
        setComparisonResults([]);
      }
    } else {
      setComparisonResults([]);
    }
  }, [uploadedHierarchies, anchorHierarchyId]);

  const handleFileUploaded = (position: number, hierarchy: Hierarchy) => {
    const newUploaded = [...uploadedHierarchies];
    newUploaded[position] = hierarchy;
    setUploadedHierarchies(newUploaded);
    
    // Auto-select first hierarchy as anchor if none selected
    if (!anchorHierarchyId && position === 0) {
      setAnchorHierarchyId(hierarchy.id);
    }
  };

  const handleFileRemoved = (position: number) => {
    const newUploaded = [...uploadedHierarchies];
    const removedId = newUploaded[position]?.id;
    newUploaded[position] = null;
    setUploadedHierarchies(newUploaded);
    
    // Clear anchor if it was the removed hierarchy
    if (removedId === anchorHierarchyId) {
      const remaining = newUploaded.filter((h): h is Hierarchy => h !== null);
      setAnchorHierarchyId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddThirdHierarchy = () => {
    // Third slot is already available, just needs to be populated
  };

  const handleRemoveThirdHierarchy = () => {
    handleFileRemoved(2);
  };

  const selectedCount = uploadedHierarchies.filter(h => h !== null).length;
  const showThirdSelector = selectedCount >= 2;
  const allHierarchies = uploadedHierarchies.filter((h): h is Hierarchy => h !== null);

  return (
    <div className={`app ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Course Hierarchy Comparison</h1>
            {isExpanded && (
              <p className="subtitle">
                Compare implementation models (IC, CR, Honors) to ensure consistency and compliance
              </p>
            )}
          </div>
          <button
            className="expand-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? '←' : '→'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* File Upload Section */}
        <section className="selection-section">
          <div className="selectors-container">
            <FileUpload
              onFileUploaded={(hierarchy) => handleFileUploaded(0, hierarchy)}
              onFileRemoved={() => handleFileRemoved(0)}
              label="Course 1"
              position={0}
              uploadedHierarchy={uploadedHierarchies[0]}
            />

            <FileUpload
              onFileUploaded={(hierarchy) => handleFileUploaded(1, hierarchy)}
              onFileRemoved={() => handleFileRemoved(1)}
              label="Course 2"
              position={1}
              uploadedHierarchy={uploadedHierarchies[1]}
            />

            {showThirdSelector && (
              <FileUpload
                onFileUploaded={(hierarchy) => handleFileUploaded(2, hierarchy)}
                onFileRemoved={() => handleFileRemoved(2)}
                label="Course 3 (Optional)"
                position={2}
                uploadedHierarchy={uploadedHierarchies[2]}
              />
            )}
          </div>

          {/* Add/Remove Third Hierarchy Button */}
          {!showThirdSelector && selectedCount === 2 && (
            <div className="add-hierarchy-control">
              <button
                className="add-hierarchy-btn"
                onClick={handleAddThirdHierarchy}
              >
                + Add Third Hierarchy (for 3-way comparison)
              </button>
            </div>
          )}

          {showThirdSelector && (
            <div className="remove-hierarchy-control">
              <button
                className="remove-hierarchy-btn"
                onClick={handleRemoveThirdHierarchy}
              >
                Remove Third Hierarchy
              </button>
            </div>
          )}

          {/* Anchor Selection */}
          {selectedCount >= 2 && (
            <div className="anchor-selection">
              <label className="anchor-label">Select Anchor Course:</label>
              <div className="anchor-options">
                {uploadedHierarchies.map((hierarchy, index) => {
                  if (!hierarchy) return null;
                  
                  return (
                    <label key={index} className="anchor-option">
                      <input
                        type="radio"
                        name="anchor"
                        value={hierarchy.id}
                        checked={anchorHierarchyId === hierarchy.id}
                        onChange={(e) => setAnchorHierarchyId(e.target.value)}
                      />
                      <span>{hierarchy.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Comparison Results Section */}
        <section className="comparison-section">
          <ComparisonView
            hierarchies={allHierarchies}
            selectedHierarchies={uploadedHierarchies.map(h => 
              h ? { hierarchyId: h.id, versionId: h.currentVersion?.versionId || h.versions[0]?.versionId || '' } : null
            )}
            comparisonResults={comparisonResults}
            anchorHierarchyId={anchorHierarchyId}
          />
        </section>
      </main>

      {isExpanded && (
        <footer className="app-footer">
          <p>Wireframe for Course Hierarchy Comparison Feature</p>
          <p className="footer-note">
            Use Case 1: Course builders compare 2 hierarchies | Use Case 2: Publishers compare 3 hierarchies
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;

