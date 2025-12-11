import { Command } from '../core/Command.js';

export class CurlCommand extends Command {
  constructor() {
    super('curl', 'Download file', { category: 'Downloads' });
  }

  execute(params, context) {
    if (params.length === 0) {
      context.output.write(`<span class="error">curl: missing URL or file name</span>`);
      return;
    }

    if (params[0] === '-O' && params[1] === 'resume.pdf') {
      const currentDir = context.fileSystem.getCurrentDirectory();
      if (currentDir.contents['resume.pdf']) {
        if (!context.isDemoMode) {
          const link = document.createElement('a');
          link.href = 'VaishnavP_3+_yrs_SoftwareDeveloper.pdf';
          link.download = 'Vaishnav_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        context.output.write(`<span class="success">Resume Downloaded</span>`);
      } else {
        context.output.write(`<span class="error">curl: resume.pdf: No such file</span>`);
      }
    } else {
      context.output.write(`<span class="error">curl: only 'curl -O resume.pdf' is supported</span>`);
    }
  }
}
