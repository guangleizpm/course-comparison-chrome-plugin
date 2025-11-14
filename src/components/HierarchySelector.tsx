/**
 * HierarchySelector Component
 * Allows users to select hierarchies from the library and choose versions
 * Supports selection across pagination and multiple hierarchy types
 */

import { useState } from 'react';
import { Hierarchy } from '../types';
import './HierarchySelector.css';

interface HierarchySelectorProps {
  hierarchies: Hierarchy[];
  selectedHierarchyId: string | null;
  selectedVersionId: string | null;
  onSelect: (hierarchyId: string, versionId: string) => void;
  label: string;
  position: number;
}

export const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  hierarchies,
  selectedHierarchyId,
  selectedVersionId,
  onSelect,
  label,
  position: _position,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedHierarchy = hierarchies.find(h => h.id === selectedHierarchyId);
  const filteredHierarchies = hierarchies.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.courseId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHierarchySelect = (hierarchy: Hierarchy) => {
    const latestVersion = hierarchy.versions.find(v => v.isLatest) || hierarchy.versions[0];
    onSelect(hierarchy.id, latestVersion.versionId);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleVersionChange = (versionId: string) => {
    if (selectedHierarchyId) {
      onSelect(selectedHierarchyId, versionId);
    }
  };

  return (
    <div className="hierarchy-selector">
      <label className="selector-label">{label}</label>
      
      {/* Hierarchy Selection */}
      <div className="hierarchy-input-wrapper">
        <input
          type="text"
          className="hierarchy-input"
          placeholder="Search or select hierarchy..."
          value={selectedHierarchy ? selectedHierarchy.name : searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        {showDropdown && (
          <div className="hierarchy-dropdown">
            {filteredHierarchies.length === 0 ? (
              <div className="dropdown-item no-results">No hierarchies found</div>
            ) : (
              filteredHierarchies.map(hierarchy => (
                <div
                  key={hierarchy.id}
                  className={`dropdown-item ${hierarchy.id === selectedHierarchyId ? 'selected' : ''}`}
                  onClick={() => handleHierarchySelect(hierarchy)}
                >
                  <div className="hierarchy-name">{hierarchy.name}</div>
                  <div className="hierarchy-meta">
                    {hierarchy.courseId && <span className="course-id">{hierarchy.courseId}</span>}
                    {hierarchy.implementationModel && (
                      <span className="impl-model">{hierarchy.implementationModel}</span>
                    )}
                    {hierarchy.type && <span className="hierarchy-type">{hierarchy.type}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Version Selection */}
      {selectedHierarchy && (
        <div className="version-selector">
          <label className="version-label">Version:</label>
          <select
            className="version-dropdown"
            value={selectedVersionId || ''}
            onChange={(e) => handleVersionChange(e.target.value)}
          >
            {selectedHierarchy.versions.map(version => (
              <option key={version.versionId} value={version.versionId}>
                {version.versionNumber} {version.isLatest ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Hierarchy Info */}
      {selectedHierarchy && (
        <div className="selected-info">
          <div className="info-row">
            <span className="info-label">Type:</span>
            <span className="info-value">{selectedHierarchy.type}</span>
          </div>
          {selectedHierarchy.subject && (
            <div className="info-row">
              <span className="info-label">Subject:</span>
              <span className="info-value">{selectedHierarchy.subject}</span>
            </div>
          )}
          {selectedHierarchy.implementationModel && (
            <div className="info-row">
              <span className="info-label">Model:</span>
              <span className="info-value">{selectedHierarchy.implementationModel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

