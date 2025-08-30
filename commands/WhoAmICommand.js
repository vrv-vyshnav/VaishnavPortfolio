import { Command } from '../core/Command.js';

export class WhoAmICommand extends Command {
  constructor() {
    super('whoami', 'Display current user and professional summary');
  }

  async execute(params, context) {
    try {
      const res = await fetch('/content/whoami.html');
      const html = await res.text();
      context.output.write(html);
    } catch (e) {
      context.output.write('whoami: unable to load content');
    }
}}