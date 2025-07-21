import { Command } from '../core/Command.js';

export class WhoAmICommand extends Command {
  constructor() {
    super('whoami', 'Display current user and professional summary');
  }

  execute(params, context) {
    const userInfo = ` <span> </span>
    <span class="success">========================================</span>
    <span class="text-yellow-400">    VAISHNAV P</span>
    <span class="text-yellow-400">    ASP.NET Full Stack Developer</span>
    <span class="text-yellow-400">    2+ Years Experience</span>
    <span class="success">========================================</span>

    <span >🚀 Jr. Software Engineer @ Eloit Innovation Pvt Ltd</span>
    <span >📊 Core developer for Edisapp (AI-powered school ERP)</span>
    <span >🌍 Serving 180+ institutions across 4 continents</span>
    <span >🏆 Team Achiever Award recipient</span>

    <span class="text-yellow-400">TECH STACK:</span>
    <span >• Languages: C#, JavaScript, Python, SQL</span>
    <span >• Frontend: Vue.js, HTML5, CSS3</span>
    <span >• Backend: ASP.NET Core MVC, RESTful APIs</span>
    <span >• Database: MS SQL Server (Stored Procedures, Functions)</span>
    <span >• Tools: Git, AWS, Telerik Kendo UI, Reporting</span>

    <span class="text-yellow-400">EXPERTISE:</span>
    <span >• Microservices Architecture & Clean Architecture</span>
    <span >• ISO 27001 & ISO 9001 compliant applications</span>
    <span >• Agile Scrum methodology </span>
    <span >• Database optimization & performance tuning</span>

    <span class="text-yellow-400">CONTACT:</span>
    <span >• Email: <a href="mailto:VaishnavP.intr@gmail.com">VaishnavP.intr@gmail.com</a></span>
    <span >• Phone: <a href="tel:+918129637037">+91 8129637037</a></span>
    <span >• LinkedIn: <a href="https://www.linkedin.com/in/vrv-vyshnav/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/vrv-vyshnav/</a></span>

    <span class="success">========================================</span>`;
        
    context.output.write(userInfo);
  }
}