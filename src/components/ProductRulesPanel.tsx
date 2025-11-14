/**
 * ProductRulesPanel Component
 * Displays product rule violations for each hierarchy
 * Shows subject-specific rules and their compliance status
 */

import React from 'react';
import { Hierarchy, ComparisonResult } from '../types';
import './ProductRulesPanel.css';

interface ProductRulesPanelProps {
  comparisonResults: ComparisonResult[];
  selectedHierarchies: Array<{ hierarchyId: string; versionId: string } | null>;
  hierarchies: Hierarchy[];
}

export const ProductRulesPanel: React.FC<ProductRulesPanelProps> = ({
  comparisonResults,
  selectedHierarchies: _selectedHierarchies,
  hierarchies,
}) => {

  const getSubjectRules = (subject: string) => {
    const rules: Record<string, { name: string; description: string }> = {};
    
    if (subject === 'Science') {
      rules['SCI-001'] = {
        name: 'Virtual Labs Limit',
        description: 'Science can only have 20 virtual labs',
      };
      rules['SCI-IC-HON-001'] = {
        name: 'Project Requirement',
        description: 'Science IC/Honors: at least 1 project per semester and ideally in the same semester',
      };
      rules['SCI-CR-001'] = {
        name: 'Teacher Graded Content Removal',
        description: 'Science CR only: all teacher graded content is removed (FR, labs, etc.)',
      };
    } else if (subject === 'Math') {
      rules['MATH-IC-HON-001'] = {
        name: 'Short Writings Requirement',
        description: 'Math IC and Honors: 2 short writings per semester',
      };
      rules['MATH-CR-001'] = {
        name: 'Teacher Graded Content Removal',
        description: 'Math CR only: all teacher graded content must be removed',
      };
    }
    
    return rules;
  };

  const getHierarchySubject = (hierarchyId: string) => {
    const hierarchy = hierarchies.find(h => h.id === hierarchyId);
    return hierarchy?.subject || 'Unknown';
  };

  const allViolations = comparisonResults.flatMap(result => 
    result.productRuleViolations.map(violation => ({
      ...violation,
      hierarchyId: result.hierarchyId,
      hierarchyName: result.hierarchyName,
    }))
  );

  const violationsByHierarchy = comparisonResults.reduce((acc, result) => {
    acc[result.hierarchyId] = result.productRuleViolations;
    return acc;
  }, {} as Record<string, ComparisonResult['productRuleViolations']>);

  return (
    <div className="product-rules-panel">
      <div className="rules-header">
        <h3>Product Rules Compliance</h3>
        <p className="rules-description">
          Verify that each implementation model follows subject-specific product rules
        </p>
      </div>

      {comparisonResults.map((result) => {
        const subject = getHierarchySubject(result.hierarchyId);
        const subjectRules = getSubjectRules(subject);
        const violations = violationsByHierarchy[result.hierarchyId] || [];

        return (
          <div key={result.hierarchyId} className="hierarchy-rules-section">
            <div className="hierarchy-rules-header">
              <h4>{result.hierarchyName}</h4>
              <span className="subject-badge">{subject}</span>
              <span className={`compliance-status ${violations.length === 0 ? 'compliant' : 'non-compliant'}`}>
                {violations.length === 0 ? '✓ Compliant' : `⚠ ${violations.length} Violation(s)`}
              </span>
            </div>

            {/* Rule Violations */}
            {violations.length > 0 && (
              <div className="violations-section">
                <h5 className="violations-title">Rule Violations</h5>
                {violations.map((violation, idx) => (
                  <div
                    key={idx}
                    className={`violation-item ${violation.severity}`}
                  >
                    <div className="violation-header">
                      <span className="violation-icon">
                        {violation.severity === 'error' ? '🔴' : '🟡'}
                      </span>
                      <span className="violation-rule-name">{violation.ruleName}</span>
                      <span className="violation-severity">{violation.severity.toUpperCase()}</span>
                    </div>
                    <div className="violation-description">{violation.ruleDescription}</div>
                    <div className="violation-details">{violation.details}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Applicable Rules Reference */}
            <div className="applicable-rules">
              <h5 className="applicable-rules-title">Applicable Rules for {subject}</h5>
              <div className="rules-list">
                {Object.entries(subjectRules).map(([ruleId, rule]) => {
                  const hasViolation = violations.some(v => v.ruleId === ruleId);
                  return (
                    <div
                      key={ruleId}
                      className={`rule-item ${hasViolation ? 'has-violation' : ''}`}
                    >
                      <div className="rule-id">{ruleId}</div>
                      <div className="rule-name">{rule.name}</div>
                      <div className="rule-description">{rule.description}</div>
                      {hasViolation && (
                        <div className="rule-status">⚠ Violation detected</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="rules-summary">
        <div className="summary-item">
          <span className="summary-label">Total Violations:</span>
          <span className="summary-value error">{allViolations.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Compliant Hierarchies:</span>
          <span className="summary-value">
            {comparisonResults.filter(r => r.productRuleViolations.length === 0).length} / {comparisonResults.length}
          </span>
        </div>
      </div>
    </div>
  );
};

