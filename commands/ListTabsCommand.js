import { Command } from '../core/Command.js';

export class ListTabsCommand extends Command {
  constructor() {
    super('listtabs', 'List all open terminal tabs', { category: 'Terminal Management' });
  }

  async execute(args, context) {
    const terminalManager = window.terminalManager;
    if (!terminalManager) {
      context.output.write('Terminal manager not available');
      return;
    }

    const tabs = terminalManager.getAllTabsInfo();
    const activeTabId = terminalManager.getActiveTerminalId();
    
    if (tabs.length === 0) {
      context.output.write('No terminal tabs available');
      return;
    }

    let output = '<span class="info">Open Terminal Tabs:</span><br>';
    tabs.forEach((tab, index) => {
      const tabNumber = index + 1;
      const isActive = tab.id === activeTabId;
      const indicator = isActive ? '● ' : '  ';
      const highlight = isActive ? '<span class="highlight">' : '';
      const highlightEnd = isActive ? '</span>' : '';
      
      output += `${indicator}${highlight}Tab ${tabNumber}: ${tab.title}${highlightEnd}<br>`;
    });
    
    const currentTabNumber = terminalManager.getCurrentTabNumber();
    output += `<br><span class="info">Currently active: Tab ${currentTabNumber}</span>`;

    context.output.write(output);
  }

}