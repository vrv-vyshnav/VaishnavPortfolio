export class Command {
  constructor(name, description, options = {}) {
    this.name = name;       
    this.description = description;
    this.hidden = options.hidden || false;
    this.category = options.category || 'Other';
  }

  execute() {
    throw new Error('Execute method must be implemented');
  }
}
