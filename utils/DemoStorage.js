export class DemoStorage {
  static STORAGE_KEY = 'vaishnav_portfolio_demo';
  static VISITED_KEY = 'vaishnav_portfolio_visited';
  static VERSION = '2.0';

  static isFirstVisit() {
    try {
      const visited = localStorage.getItem(this.VISITED_KEY);
      return !visited;
    } catch (error) {
      console.warn('Failed to check visit status:', error);
      return false;
    }
  }

  static markVisited() {
    try {
      localStorage.setItem(this.VISITED_KEY, 'true');
      return true;
    } catch (error) {
      console.warn('Failed to mark as visited:', error);
      return false;
    }
  }

  static getDemoStatus() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return {
          phase1Completed: false,
          phase2Completed: false,
          completedAt: null,
          version: this.VERSION
        };
      }

      const status = JSON.parse(data);

      if (typeof status !== 'object' || status === null) {
        return this.getDefaultStatus();
      }

      return {
        phase1Completed: status.phase1Completed || false,
        phase2Completed: status.phase2Completed || false,
        completedAt: status.completedAt || null,
        version: status.version || this.VERSION
      };
    } catch (error) {
      console.warn('Failed to read demo status from localStorage:', error);
      return this.getDefaultStatus();
    }
  }

  static getDefaultStatus() {
    return {
      phase1Completed: false,
      phase2Completed: false,
      completedAt: null,
      version: this.VERSION
    };
  }

  static setDemoCompleted(phase) {
    try {
      const currentStatus = this.getDemoStatus();

      if (phase === 'phase1') {
        currentStatus.phase1Completed = true;
      } else if (phase === 'phase2') {
        currentStatus.phase2Completed = true;
      } else if (phase === 'both') {
        currentStatus.phase1Completed = true;
        currentStatus.phase2Completed = true;
      }

      currentStatus.completedAt = Date.now();
      currentStatus.version = this.VERSION;

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentStatus));
      return true;
    } catch (error) {
      console.warn('Failed to save demo status to localStorage:', error);
      return false;
    }
  }

  static resetDemo() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Failed to reset demo status:', error);
      return false;
    }
  }

  static hasCompletedPhase(phase) {
    const status = this.getDemoStatus();
    return phase === 'phase1' ? status.phase1Completed : status.phase2Completed;
  }

  static hasCompletedAll() {
    const status = this.getDemoStatus();
    return status.phase1Completed && status.phase2Completed;
  }

  static isAvailable() {
    try {
      const test = '__demo_storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
