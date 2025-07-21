export class Command {
  constructor(name, description) {
    this.name = name;       
    this.description = description;  
  }

  execute(params, context) {
    throw new Error('Execute method must be implemented');
  }
}
