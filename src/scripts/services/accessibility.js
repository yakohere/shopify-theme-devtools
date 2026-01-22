/**
 * Accessibility Service
 * Shared service for storing and accessing accessibility scan results
 * Used by both the accessibility panel and AI panel
 */

class AccessibilityService {
  constructor() {
    this._score = null;
    this._issues = [];
    this._lastScanTime = null;
    this._listeners = new Set();
  }

  /**
   * Get the current accessibility score
   * @returns {number|null}
   */
  get score() {
    return this._score;
  }

  /**
   * Get the current accessibility issues
   * @returns {Array}
   */
  get issues() {
    return this._issues;
  }

  /**
   * Get the last scan timestamp
   * @returns {Date|null}
   */
  get lastScanTime() {
    return this._lastScanTime;
  }

  /**
   * Check if a scan has been performed
   * @returns {boolean}
   */
  get hasScanned() {
    return this._lastScanTime !== null;
  }

  /**
   * Get summary counts by severity
   * @returns {Object}
   */
  get summary() {
    return {
      total: this._issues.length,
      errors: this._issues.filter(i => i.severity === 'error').length,
      warnings: this._issues.filter(i => i.severity === 'warning').length,
      info: this._issues.filter(i => i.severity === 'info').length,
    };
  }

  /**
   * Update the scan results
   * @param {Object} results - { score, issues }
   */
  setResults({ score, issues }) {
    this._score = score;
    this._issues = issues || [];
    this._lastScanTime = new Date();
    this._notifyListeners();
  }

  /**
   * Clear the scan results
   */
  clear() {
    this._score = null;
    this._issues = [];
    this._lastScanTime = null;
    this._notifyListeners();
  }

  /**
   * Subscribe to changes
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  _notifyListeners() {
    const data = {
      score: this._score,
      issues: this._issues,
      lastScanTime: this._lastScanTime,
    };
    this._listeners.forEach(cb => cb(data));
  }

  /**
   * Get data formatted for AI context serialization
   * @returns {Object|null}
   */
  getForAI() {
    if (!this.hasScanned) {
      return null;
    }

    return {
      score: this._score,
      issues: this._issues.map(issue => ({
        id: issue.id,
        severity: issue.severity,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        wcagRef: issue.wcagRef,
        wcagLevel: issue.wcagLevel,
        suggestedFix: issue.suggestedFix,
        selector: issue.selector,
      })),
    };
  }
}

export const accessibilityService = new AccessibilityService();
