import { DemoModal } from './DemoModal.js';

export class DemoManager {
  static currentModal = null;
  static isActive = false;
  static cleanupTimer = null;

  static async startDemo(terminalManager) {
    if (this.isActive || this.cleanupTimer) {
      await this.cancelCurrentDemo();
    }

    if (!this.currentModal) {
      this.currentModal = new DemoModal(terminalManager);
    } else {
      this.currentModal.reset();
      this.currentModal.terminalManager = terminalManager;
    }

    this.isActive = true;

    try {
      const result = await this.currentModal.show();
      this.isActive = false;
      return result;
    } catch (error) {
      this.isActive = false;
      throw error;
    }
  }

  static async cancelCurrentDemo() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    if (this.currentModal && this.currentModal.isActive) {
      this.currentModal.forceClose();
    }

    this.isActive = false;
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  static isAnyDemoActive() {
    return this.isActive || this.cleanupTimer !== null;
  }
}
