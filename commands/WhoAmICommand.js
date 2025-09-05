import { Command } from '../core/Command.js';

export class WhoAmICommand extends Command {
  constructor() {
    super('whoami', 'Display current user and professional summary', { category: 'System Information' });
  }

  async execute(params, context) {
    // Display user information directly like a proper terminal whoami command
    const user = context.fileSystem.userName || 'vaishnav';
    
    context.output.write(`${user}`);
    
    // Add professional summary for portfolio context
    const summary = this.getProfessionalSummary();
    
    // Remove ASCII borders on mobile devices  
    let content = summary;
    if (window.innerWidth <= 768) {
      content = this.removeMobileASCIIBorders(content);
      // Add some mobile-specific formatting improvements
      content = this.optimizeForMobile(content);
    }
    
    context.output.write(`\n\n<pre class="file-content">${content}</pre>`);
  }
  
  getProfessionalSummary() {
    return ` _    _ _             ___  ___  ___ 
| |  | | |            |  \\/  | |_ _|
| |  | | |__   ___    | .  . |  | | 
| |/\\| | '_ \\ / _ \\   | |\\/| |  | | 
\\  /\\  / | | | (_) |  | |  | | _| |_
 \\/  \\/|_| |_|\\___/   \\_|  |_/ \\___/
                                    
        WhoAmI

┌─────────────────────────────────────────────────────────────────────────────┐
│ VAISHNAV P - ASP.NET Full Stack Developer                                  │
│ 2+ Years Experience | Jr. Software Engineer @ Eloit Innovation            │
└─────────────────────────────────────────────────────────────────────────────┘

CURRENT ROLE:
🚀 Jr. Software Engineer @ Eloit Innovation Pvt Ltd
📊 Core developer for Edisapp (AI-powered school ERP)
🌍 Serving 180+ institutions across 4 continents
🏆 Team Achiever Award recipient

TECH STACK:
• Languages: C#, JavaScript, Python, SQL
• Frontend: Vue.js, HTML5, CSS3
• Backend: ASP.NET Core MVC, RESTful APIs
• Database: MS SQL Server (Stored Procedures, Functions)
• Tools: Git, AWS, Telerik Kendo UI, Reporting

EXPERTISE:
• Knowledge in Monolithic, Clean Architecture & Microservices
• ISO 27001 & ISO 9001 compliant applications
• Agile Scrum methodology
• Database optimization & performance tuning

CONTACT:
• Email: VaishnavP.intr@gmail.com
• Phone: +91 8129637037
• LinkedIn: linkedin.com/in/vaishnav-p`;
  }
  
  removeMobileASCIIBorders(text) {
    // Remove ASCII border lines and extract content from bordered lines for mobile
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // Remove pure border lines (top/bottom borders)
      const borderPattern = /^[┌┐└┘│─\s]+$/;
      if (borderPattern.test(trimmedLine)) {
        return null; // Mark for removal
      }
      
      // Extract content from bordered lines like "│ VAISHNAV P - Developer │"
      const borderedContentPattern = /^│\s*(.+?)\s*│$/;
      if (borderedContentPattern.test(trimmedLine)) {
        const match = trimmedLine.match(borderedContentPattern);
        return match[1]; // Return just the content without borders
      }
      
      // Return other lines as-is
      return line;
    }).filter(line => line !== null); // Remove null entries
    
    return processedLines.join('\n');
  }
  
  optimizeForMobile(content) {
    // Add mobile-friendly formatting and spacing
    return content
      .replace(/\n\n+/g, '\n\n') // Normalize multiple newlines
      .replace(/^(\w+[^:]*:)\s*$/gm, '\n$1') // Add spacing before section headers
      .trim();
  }
}