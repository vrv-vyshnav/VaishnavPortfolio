import { Command } from '../core/Command.js';

export class WhoAmICommand extends Command {
  constructor() {
    super('whoami', 'Display current user and professional summary');
  }

  execute(params, context) {
    const userInfo = `

    <span class="success">========================================</span>
    <span class="success">         VAISHNAV P</span>
    <span class="success">    .NET Full Stack Developer</span>
    <span class="success">      2+ Years Experience</span>
    <span class="success">========================================</span>

    <span class="info">🚀 Jr. Software Engineer @ Eloit Innovation Pvt Ltd</span>
    <span class="info">📊 Core developer for Edisapp (AI-powered school ERP)</span>
    <span class="info">🌍 Serving 180+ institutions across 4 continents</span>
    <span class="info">🏆 Team Achiever Award recipient</span>

    <span class="warning">TECH STACK:</span>
    <span class="info">• Languages: C#, JavaScript, Python, SQL</span>
    <span class="info">• Frontend: Vue.js, HTML5, CSS3</span>
    <span class="info">• Backend: ASP.NET Core MVC, RESTful APIs</span>
    <span class="info">• Database: MS SQL Server (Stored Procedures, Functions)</span>
    <span class="info">• Tools: Git, AWS, Telerik Kendo UI, Reporting</span>

    <span class="warning">EXPERTISE:</span>
    <span class="info">• Microservices Architecture & Clean Architecture</span>
    <span class="info">• ISO 27001 & ISO 9001 compliant applications</span>
    <span class="info">• Agile Scrum methodology </span>
    <span class="info">• Database optimization & performance tuning</span>

    <span class="warning">CONTACT:</span>
    <span class="info">• Email: <a href="mailto:VaishnavP.intr@gmail.com">VaishnavP.intr@gmail.com</a></span>
    <span class="info">• Phone: <a href="tel:+918129637037">+91 8129637037</a></span>
    <span class="info">• LinkedIn: <a href="https://www.linkedin.com/in/vrv-vyshnav/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/vrv-vyshnav/</a></span>

    <span class="success">========================================</span>`;
        
    context.output.write(userInfo);
  }
}