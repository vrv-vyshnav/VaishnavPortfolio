class Terminal {
  constructor() {
    this.currentPath = "/home/vaishnav/portfolio";
    this.userName = "vaishnav";
    this.hostName = "dev";
    this.history = [];
    this.historyIndex = -1;

    this.fileSystem = {
      "/home/vaishnav/portfolio": {
        type: "directory",
        contents: {
          "about.txt": {
            type: "file",
            content: `Name: Vaishnav P
Role: Jr. Software Engineer
Company: Eloit Innovation Private Limited
Location: Kerala, India
Experience: 2+ years
Email: VaishnavP.intr@gmail.com
Phone: +91 8129637037
LinkedIn: linkedin.com/in/vaishnav-p

About:
======
Passionate Jr. Software Engineer with expertise in full-stack development,
ERP systems, and scalable application architecture. Currently working as a
core developer for Edisapp, an AI-powered school management ERP platform
serving 180+ institutions across four continents.

I specialize in building robust, secure applications using Clean Architecture
principles and modern web technologies. My work focuses on creating scalable
solutions that meet international standards including ISO 27001 and ISO 9001.

Specialties:
- Full-stack web development (C#, JavaScript, Python)
- ERP and management systems
- Database design and optimization
- Microservices architecture
- Agile development practices
- Clean Architecture implementation`,
          },
          "experience.txt": {
            type: "file",
            content: `WORK EXPERIENCE
===============

Jr. Software Engineer
Eloit Innovation Private Limited
March 2023 - Present

• Core developer for Edisapp, Eloit's AI-powered school management ERP 
  platform, serving 180+ institutions across four continents.

• Designed and built scalable modules using Wisdom Architecture and Clean 
  Architecture principles to ensure modularity and high performance.

• Developed microservices and backend APIs using .NET MVC and RESTful 
  API standards.

• Worked extensively with MS SQL Server for database design, writing 
  optimized stored procedures, functions, and performance tuning.

• Implemented secure, high-performing web applications aligned with 
  ISO 27001 (data security) and ISO 9001 (quality management) standards.

• Collaborated in Agile Scrum teams, participating in sprint planning, 
  peer code reviews, and continuous integration processes.

INTERNSHIP
==========

Frontend Developer
Nerchapetti
Aug 2021 - Feb 2022

• Developed Frontend Web application from scratch using React.js
• Managed the bug report throughout the internship period

ACHIEVEMENTS
============

Team Achiever Award - Eloit Innovation Private Limited
Awarded for outstanding individual performance and significant 
contribution to team success.`,
          },
          projects: {
            type: "directory",
            contents: {
              "bom-manager": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Component Bill of Materials Manager (BOM Manager)

A centralized component BOM management system to reduce repeated manual 
effort and duplication of components.

## Duration: May 2020 - June 2021

## Technologies Used:
- Backend: PHP
- Database: MySQL
- Server: Apache
- Stack: LAMP (Linux, Apache, MySQL, PHP)

## Features:
- Centralized component management
- Reduction of manual effort and duplication
- Streamlined BOM creation and maintenance
- Component tracking and organization
- User-friendly interface for component management

## Description:
Developed a comprehensive BOM management system that centralizes component 
information and reduces manual effort in creating and maintaining bills of 
materials. The system helps organizations track components efficiently and 
eliminates duplication of effort across different projects.`,
                  },
                },
              },
              "lets-go-everywhere": {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Let's Go Everywhere

A comprehensive bus travel guide application that helps travelers with 
routes, stops, maps, and real-time tracking.

## Duration: May 2021 - 2022

## Technologies Used:
- Backend: Django
- Database: MySQL
- Frontend: JavaScript
- Maps Integration: Location tracking APIs

## Features:
- Route guidance for bus travelers
- Display of all possible stops on the route to destination
- Interactive maps with real-time location tracking
- Estimated remaining time to reach destination
- Comprehensive stop information
- User-friendly interface for travel planning

## Description:
Developed a full-stack web application to assist bus travelers with 
comprehensive route information. The application provides real-time 
tracking, displays all stops along the route, shows interactive maps, 
and calculates estimated arrival times to help travelers plan their 
journeys effectively.

## Key Achievements:
- Implemented real-time location tracking
- Created intuitive user interface for route planning
- Integrated mapping services for visual route display
- Developed accurate time estimation algorithms`,
                  },
                },
              },
              edisapp: {
                type: "directory",
                contents: {
                  "README.md": {
                    type: "file",
                    content: `# Edisapp - AI-Powered School Management ERP

A comprehensive school management ERP platform serving 180+ institutions 
across four continents.

## Role: Core Developer
## Company: Eloit Innovation Private Limited
## Duration: March 2023 - Present

## Technologies Used:
- Backend: ASP.NET Core MVC, C#
- Frontend: Vue.js, JavaScript
- Database: MS SQL Server
- Architecture: Clean Architecture, Wisdom Architecture
- Tools: Telerik Kendo UI, Git
- Standards: ISO 27001, ISO 9001

## Key Responsibilities:
- Core development of AI-powered school management features
- Design and implementation of scalable modules
- Microservices development using .NET MVC
- RESTful API development and maintenance
- Database design and optimization
- Performance tuning and security implementation

## Features Developed:
- Student information management
- Academic performance tracking
- Administrative workflows
- Reporting and analytics
- Multi-institution support
- AI-powered insights and recommendations

## Achievements:
- Successfully serving 180+ institutions globally
- Implemented ISO 27001 and ISO 9001 compliant solutions
- Contributed to high-performance, scalable architecture
- Participated in Agile development processes
- Received Team Achiever Award for outstanding performance

## Architecture:
- Clean Architecture principles for maintainability
- Wisdom Architecture for modularity
- Microservices for scalability
- RESTful APIs for integration`,
                  },
                },
              },
            },
          },
          "skills.conf": {
            type: "file",
            content: `# Skills Configuration File

[languages]
C#=advanced
JavaScript=advanced
SQL=advanced
Python=intermediate
HTML/CSS=intermediate

[web_technologies]
Vue.js=intermediate
ASP.NET Core MVC=advanced
RESTful APIs=advanced
Microservices=intermediate

[databases]
MS SQL Server=advanced
MySQL=intermediate
Database Design=advanced
Stored Procedures=advanced
Performance Tuning=intermediate

[tools_and_frameworks]
Telerik Kendo UI=intermediate
Git=intermediate
Visual Studio=advanced
Clean Architecture=intermediate
Wisdom Architecture=intermediate

[cloud_and_devops]
AWS=beginner
Linux=intermediate
Apache=intermediate

[development_practices]
Agile/Scrum=intermediate
Code Reviews=intermediate
Continuous Integration=intermediate
Test-Driven Development=beginner
API Documentation=intermediate

[standards_and_compliance]
ISO 27001=intermediate
ISO 9001=intermediate
Data Security=intermediate
Quality Management=intermediate

[soft_skills]
Team Collaboration=advanced
Problem Solving=advanced
Communication=intermediate
Leadership=intermediate
Mentoring=beginner`,
          },
          "education.txt": {
            type: "file",
            content: `EDUCATION
=========

Bachelor of Computer Science
College of Applied Science
2019 - 2022

Relevant Coursework:
- Data Structures and Algorithms
- Database Management Systems
- Software Engineering
- Web Technologies
- Object-Oriented Programming
- Computer Networks
- Operating Systems

Higher Secondary Education
Sreenarayana Higher Secondary School
2017 - 2019

Stream: Computer Science
- Mathematics
- Physics
- Chemistry
- Computer Science

Academic Projects:
- Component BOM Manager (Final Year Project)
- Various web development projects
- Database design and implementation projects`,
          },
          "contact.info": {
            type: "file",
            content: `Contact Information
===================

Email: VaishnavP.intr@gmail.com
Phone: +91 8129637037
Location: Kerala, India

Social Links:
-------------
LinkedIn: https://linkedin.com/in/vaishnav-p
GitHub: https://github.com/vaishnav-p (if available)

Professional Details:
--------------------
Current Position: Jr. Software Engineer
Company: Eloit Innovation Private Limited
Experience: 2+ years
Availability: Open to opportunities

Preferred Contact:
-----------------
Primary: Email
Secondary: Phone
Response Time: Within 24 hours
Time Zone: IST (UTC+5:30)

Technical Interests:
-------------------
- Full-stack web development
- ERP systems development
- Database optimization
- Clean architecture implementation
- Microservices development
- Cloud technologies (AWS)

Career Goals:
------------
- Senior Software Engineer roles
- Technical leadership positions
- Specialization in enterprise applications
- Cloud architecture expertise`,
          },
          "resume.pdf": {
            type: "file",
            content: "Binary resume file - Use curl -O resume.pdf to download",
          },
        },
      },
      "/home/vaishnav/portfolio/projects": {
        type: "directory",
        contents: {
          "bom-manager": {
            type: "directory",
            contents: {
              "README.md": {
                type: "file",
                content: `# Component Bill of Materials Manager (BOM Manager)

A centralized component BOM management system to reduce repeated manual 
effort and duplication of components.

## Duration: May 2020 - June 2021

## Technologies Used:
- Backend: PHP
- Database: MySQL
- Server: Apache
- Stack: LAMP (Linux, Apache, MySQL, PHP)

## Features:
- Centralized component management
- Reduction of manual effort and duplication
- Streamlined BOM creation and maintenance
- Component tracking and organization
- User-friendly interface for component management

## Description:
Developed a comprehensive BOM management system that centralizes component 
information and reduces manual effort in creating and maintaining bills of 
materials. The system helps organizations track components efficiently and 
eliminates duplication of effort across different projects.`,
              },
            },
          },
          "lets-go-everywhere": {
            type: "directory",
            contents: {
              "README.md": {
                type: "file",
                content: `# Let's Go Everywhere

A comprehensive bus travel guide application that helps travelers with 
routes, stops, maps, and real-time tracking.

## Duration: May 2021 - 2022

## Technologies Used:
- Backend: Django
- Database: MySQL
- Frontend: JavaScript
- Maps Integration: Location tracking APIs

## Features:
- Route guidance for bus travelers
- Display of all possible stops on the route to destination
- Interactive maps with real-time location tracking
- Estimated remaining time to reach destination
- Comprehensive stop information
- User-friendly interface for travel planning

## Description:
Developed a full-stack web application to assist bus travelers with 
comprehensive route information. The application provides real-time 
tracking, displays all stops along the route, shows interactive maps, 
and calculates estimated arrival times to help travelers plan their 
journeys effectively.

## Key Achievements:
- Implemented real-time location tracking
- Created intuitive user interface for route planning
- Integrated mapping services for visual route display
- Developed accurate time estimation algorithms`,
              },
            },
          },
          edisapp: {
            type: "directory",
            contents: {
              "README.md": {
                type: "file",
                content: `# Edisapp - AI-Powered School Management ERP

A comprehensive school management ERP platform serving 180+ institutions 
across four continents.

## Role: Core Developer
## Company: Eloit Innovation Private Limited
## Duration: March 2023 - Present

## Technologies Used:
- Backend: ASP.NET Core MVC, C#
- Frontend: Vue.js, JavaScript
- Database: MS SQL Server
- Architecture: Clean Architecture, Wisdom Architecture
- Tools: Telerik Kendo UI, Git
- Standards: ISO 27001, ISO 9001

## Key Responsibilities:
- Core development of AI-powered school management features
- Design and implementation of scalable modules
- Microservices development using .NET MVC
- RESTful API development and maintenance
- Database design and optimization
- Performance tuning and security implementation

## Features Developed:
- Student information management
- Academic performance tracking
- Administrative workflows
- Reporting and analytics
- Multi-institution support
- AI-powered insights and recommendations

## Achievements:
- Successfully serving 180+ institutions globally
- Implemented ISO 27001 and ISO 9001 compliant solutions
- Contributed to high-performance, scalable architecture
- Participated in Agile development processes
- Received Team Achiever Award for outstanding performance

## Architecture:
- Clean Architecture principles for maintainability
- Wisdom Architecture for modularity
- Microservices for scalability
- RESTful APIs for integration`,
              },
            },
          },
        },
      },
      "/home/vaishnav/portfolio/projects/bom-manager": {
        type: "directory",
        contents: {
          "README.md": {
            type: "file",
            content: `# Component Bill of Materials Manager (BOM Manager)

A centralized component BOM management system to reduce repeated manual 
effort and duplication of components.

## Duration: May 2020 - June 2021

## Technologies Used:
- Backend: PHP
- Database: MySQL
- Server: Apache
- Stack: LAMP (Linux, Apache, MySQL, PHP)

## Features:
- Centralized component management
- Reduction of manual effort and duplication
- Streamlined BOM creation and maintenance
- Component tracking and organization
- User-friendly interface for component management

## Description:
Developed a comprehensive BOM management system that centralizes component 
information and reduces manual effort in creating and maintaining bills of 
materials. The system helps organizations track components efficiently and 
eliminates duplication of effort across different projects.`,
          },
        },
      },
      "/home/vaishnav/portfolio/projects/lets-go-everywhere": {
        type: "directory",
        contents: {
          "README.md": {
            type: "file",
            content: `# Let's Go Everywhere

A comprehensive bus travel guide application that helps travelers with 
routes, stops, maps, and real-time tracking.

## Duration: May 2021 - 2022

## Technologies Used:
- Backend: Django
- Database: MySQL
- Frontend: JavaScript
- Maps Integration: Location tracking APIs

## Features:
- Route guidance for bus travelers
- Display of all possible stops on the route to destination
- Interactive maps with real-time location tracking
- Estimated remaining time to reach destination
- Comprehensive stop information
- User-friendly interface for travel planning

## Description:
Developed a full-stack web application to assist bus travelers with 
comprehensive route information. The application provides real-time 
tracking, displays all stops along the route, shows interactive maps, 
and calculates estimated arrival times to help travelers plan their 
journeys effectively.

## Key Achievements:
- Implemented real-time location tracking
- Created intuitive user interface for route planning
- Integrated mapping services for visual route display
- Developed accurate time estimation algorithms`,
          },
        },
      },
      "/home/vaishnav/portfolio/projects/edisapp": {
        type: "directory",
        contents: {
          "README.md": {
            type: "file",
            content: `# Edisapp - AI-Powered School Management ERP

A comprehensive school management ERP platform serving 180+ institutions 
across four continents.

## Role: Core Developer
## Company: Eloit Innovation Private Limited
## Duration: March 2023 - Present

## Technologies Used:
- Backend: ASP.NET Core MVC, C#
- Frontend: Vue.js, JavaScript
- Database: MS SQL Server
- Architecture: Clean Architecture, Wisdom Architecture
- Tools: Telerik Kendo UI, Git
- Standards: ISO 27001, ISO 9001

## Key Responsibilities:
- Core development of AI-powered school management features
- Design and implementation of scalable modules
- Microservices development using .NET MVC
- RESTful API development and maintenance
- Database design and optimization
- Performance tuning and security implementation

## Features Developed:
- Student information management
- Academic performance tracking
- Administrative workflows
- Reporting and analytics
- Multi-institution support
- AI-powered insights and recommendations

## Achievements:
- Successfully serving 180+ institutions globally
- Implemented ISO 27001 and ISO 9001 compliant solutions
- Contributed to high-performance, scalable architecture
- Participated in Agile development processes
- Received Team Achiever Award for outstanding performance

## Architecture:
- Clean Architecture principles for maintainability
- Wisdom Architecture for modularity
- Microservices for scalability
- RESTful APIs for integration`,
          },
        },
      },
    };

    this.commands = {
      help: this.help.bind(this),
      ls: this.ls.bind(this),
      cd: this.cd.bind(this),
      cat: this.cat.bind(this),
      pwd: this.pwd.bind(this),
      whoami: this.whoami.bind(this),
      clear: this.clear.bind(this),
      tree: this.tree.bind(this),
      find: this.find.bind(this),
      grep: this.grep.bind(this),
      history: this.showHistory.bind(this),
      date: this.date.bind(this),
      echo: this.echo.bind(this),
      wc: this.wc.bind(this),
      head: this.head.bind(this),
      tail: this.tail.bind(this),
      curl: this.curl.bind(this),
    };

    this.initializeTerminal();
  }

  initializeTerminal() {
    const input = document.getElementById("user-input");
    const content = document.getElementById("terminal-content");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const command = input.value.trim();
        if (command) {
          this.history.push(command);
          this.historyIndex = this.history.length;
        }
        this.executeCommand(command);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.history[this.historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          input.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.autoComplete(input);
      }
    });

    // Keep input focused
    content.addEventListener("click", () => {
      input.focus();
    });

    // Scroll to bottom when new content is added
    this.scrollToBottom();
  }

  executeCommand(commandLine) {
    const args = commandLine.split(" ");
    const command = args[0];
    const params = args.slice(1);

    // Display the command
    this.addOutput(
      `<span class="prompt">${this.getPrompt()}</span>${commandLine}`
    );

    if (this.commands[command]) {
      this.commands[command](params);
    } else if (command === "") {
      // Empty command, just show prompt
    } else {
      this.addOutput(
        `<span class="error">Command not found: ${command}</span>`
      );
      this.addOutput(
        `<span class="info">Type 'help' to see available commands</span>`
      );
    }

    this.addNewPrompt();
  }

  addOutput(text) {
    const content = document.getElementById("terminal-content");
    const output = document.createElement("div");
    output.className = "output";
    output.innerHTML = text;

    // Remove the current input line
    const currentInput = content.querySelector(".command-line");
    if (currentInput) {
      currentInput.remove();
    }

    content.appendChild(output);
    this.scrollToBottom();
  }

  addNewPrompt() {
    const content = document.getElementById("terminal-content");
    const promptLine = document.createElement("div");
    promptLine.className = "command-line";
    promptLine.innerHTML = `
                    <span class="prompt">${this.getPrompt()}</span>
                    <input type="text" class="user-input" id="user-input" autofocus>
                    <span class="cursor">█</span>
                `;
    content.appendChild(promptLine);

    // Re-initialize event listeners for new input
    const newInput = document.getElementById("user-input");
    newInput.focus();

    // Copy event listeners
    this.initializeTerminal();
    this.scrollToBottom();
  }

  getPrompt() {
    const shortPath = this.currentPath.replace("/home/john", "~");
    return `${this.userName}@${this.hostName}:${shortPath}$`;
  }

  scrollToBottom() {
    const content = document.getElementById("terminal-content");
    content.scrollTop = content.scrollHeight;
  }

  getCurrentDirectory() {
    return this.fileSystem[this.currentPath];
  }

  resolvePath(path) {
    if (path.startsWith("/")) {
      return path;
    } else if (path === "..") {
      const parts = this.currentPath.split("/");
      parts.pop();
      return parts.join("/") || "/";
    } else if (path === ".") {
      return this.currentPath;
    } else {
      return this.currentPath + "/" + path;
    }
  }

  // Commands
  help() {
    this.addOutput(`<span class="success">Available Commands:</span>
                
<span class="help-command">help</span>    Show this help message
<span class="help-command">ls</span>      List directory contents
<span class="help-command">cd</span>      Change directory
<span class="help-command">cat</span>     Display file contents
<span class="help-command">pwd</span>     Print working directory
<span class="help-command">whoami</span>  Display current user
<span class="help-command">clear</span>   Clear terminal screen
<span class="help-command">tree</span>    Show directory tree
<span class="help-command">find</span>    Find files by name
<span class="help-command">grep</span>    Search text in files
<span class="help-command">history</span> Show command history
<span class="help-command">date</span>    Show current date and time
<span class="help-command">echo</span>    Display text
<span class="help-command">wc</span>      Count lines, words, characters
<span class="help-command">head</span>    Show first lines of file
<span class="help-command">tail</span>    Show last lines of file
<span class="help-command">curl</span>    Download file

<span class="info">Navigation Tips:</span>
- Use 'ls' to see what's available
- Use 'cd projects' to explore my projects
- Use 'cat about.txt' to learn about me
- Use 'cat skills.conf' to see my technical skills
- Use Tab for auto-completion
- Use Up/Down arrows for command history`);
  }

  ls(params) {
    const currentDir = this.getCurrentDirectory();
    if (!currentDir || currentDir.type !== "directory") {
      this.addOutput(`<span class="error">Not a directory</span>`);
      return;
    }

    const items = Object.keys(currentDir.contents);
    if (items.length === 0) {
      this.addOutput(`<span class="info">Directory is empty</span>`);
      return;
    }

    let output = "";
    items.forEach((item) => {
      const itemObj = currentDir.contents[item];
      if (itemObj.type === "directory") {
        output += `<span class="directory">${item}/</span>  `;
      } else {
        output += `<span class="file">${item}</span>  `;
      }
    });

    this.addOutput(output);
  }

  cd(params) {
    if (params.length === 0) {
      this.currentPath = "/home/john";
      return;
    }

    let targetPath;
    if (params[0].startsWith("/")) {
      targetPath = params[0];
    } else if (params[0] === "..") {
      const parts = this.currentPath.split("/");
      parts.pop();
      targetPath = parts.join("/") || "/";
    } else if (params[0] === ".") {
      targetPath = this.currentPath;
    } else {
      // Check if directory exists in current location
      const currentDir = this.getCurrentDirectory();
      if (
        currentDir &&
        currentDir.contents[params[0]] &&
        currentDir.contents[params[0]].type === "directory"
      ) {
        targetPath = this.currentPath + "/" + params[0];
      } else {
        this.addOutput(
          `<span class="error">cd: ${params[0]}: No such directory</span>`
        );
        return;
      }
    }

    if (
      this.fileSystem[targetPath] &&
      this.fileSystem[targetPath].type === "directory"
    ) {
      this.currentPath = targetPath;
    } else {
      this.addOutput(
        `<span class="error">cd: ${params[0]}: No such directory</span>`
      );
    }
  }

  cat(params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">cat: missing file operand</span>`);
      return;
    }

    const currentDir = this.getCurrentDirectory();
    const fileName = params[0];

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === "file"
    ) {
      const content = currentDir.contents[fileName].content;
      this.addOutput(`<span class="file">${content}</span>`);
    } else {
      this.addOutput(
        `<span class="error">cat: ${fileName}: No such file</span>`
      );
    }
  }

  pwd() {
    this.addOutput(`<span class="info">${this.currentPath}</span>`);
  }

  whoami() {
    this.addOutput(`<span class="success">${this.userName}</span>`);
  }

  clear() {
    const content = document.getElementById("terminal-content");
    content.innerHTML = "";
  }

  tree(params) {
    const showTree = (path, prefix = "", isLast = true) => {
      const dir = this.fileSystem[path];
      if (!dir || dir.type !== "directory") return "";

      let result = "";
      const items = Object.keys(dir.contents);
      items.forEach((item, index) => {
        const isLastItem = index === items.length - 1;
        const itemPath = path + "/" + item;
        const itemObj = dir.contents[item];

        const connector = isLastItem ? "└── " : "├── ";
        const color = itemObj.type === "directory" ? "directory" : "file";

        result += `${prefix}${connector}<span class="${color}">${item}</span>\n`;

        if (itemObj.type === "directory") {
          const nextPrefix = prefix + (isLastItem ? "    " : "│   ");
          result += showTree(itemPath, nextPrefix, isLastItem);
        }
      });

      return result;
    };

    const treeOutput = showTree(this.currentPath);
    this.addOutput(`<span class="directory">.</span>\n${treeOutput}`);
  }

  find(params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">find: missing argument</span>`);
      return;
    }

    const searchTerm = params[0];
    const findInDirectory = (path) => {
      const dir = this.fileSystem[path];
      if (!dir || dir.type !== "directory") return [];

      let results = [];
      Object.keys(dir.contents).forEach((item) => {
        const itemPath = path + "/" + item;
        if (item.includes(searchTerm)) {
          results.push(itemPath);
        }

        if (dir.contents[item].type === "directory") {
          results = results.concat(findInDirectory(itemPath));
        }
      });

      return results;
    };

    const results = findInDirectory(this.currentPath);
    if (results.length === 0) {
      this.addOutput(
        `<span class="warning">No files found matching '${searchTerm}'</span>`
      );
    } else {
      results.forEach((result) => {
        this.addOutput(`<span class="info">${result}</span>`);
      });
    }
  }

  grep(params) {
    if (params.length < 2) {
      this.addOutput(
        `<span class="error">grep: usage: grep pattern file</span>`
      );
      return;
    }

    const pattern = params[0];
    const fileName = params[1];
    const currentDir = this.getCurrentDirectory();

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === "file"
    ) {
      const content = currentDir.contents[fileName].content;
      const lines = content.split("\n");
      const matches = lines.filter((line) =>
        line.toLowerCase().includes(pattern.toLowerCase())
      );

      if (matches.length === 0) {
        this.addOutput(
          `<span class="warning">No matches found for '${pattern}'</span>`
        );
      } else {
        matches.forEach((match) => {
          const highlighted = match.replace(
            new RegExp(`(${pattern})`, "gi"),
            `<span class="warning">$1</span>`
          );
          this.addOutput(`<span class="info">${highlighted}</span>`);
        });
      }
    } else {
      this.addOutput(
        `<span class="error">grep: ${fileName}: No such file</span>`
      );
    }
  }

  showHistory() {
    if (this.history.length === 0) {
      this.addOutput(`<span class="info">No commands in history</span>`);
      return;
    }

    this.history.forEach((cmd, index) => {
      this.addOutput(`<span class="info">${index + 1}  ${cmd}</span>`);
    });
  }

  date() {
    const now = new Date();
    this.addOutput(`<span class="success">${now.toString()}</span>`);
  }

  echo(params) {
    const text = params.join(" ");
    this.addOutput(`<span class="info">${text}</span>`);
  }

  wc(params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">wc: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = this.getCurrentDirectory();

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === "file"
    ) {
      const content = currentDir.contents[fileName].content;
      const lines = content.split("\n").length;
      const words = content.split(/\s+/).filter((w) => w.length > 0).length;
      const chars = content.length;

      this.addOutput(
        `<span class="info">  ${lines}  ${words}  ${chars} ${fileName}</span>`
      );
    } else {
      this.addOutput(
        `<span class="error">wc: ${fileName}: No such file</span>`
      );
    }
  }

  head(params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">head: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = this.getCurrentDirectory();

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === "file"
    ) {
      const content = currentDir.contents[fileName].content;
      const lines = content.split("\n").slice(0, 10);
      this.addOutput(`<span class="file">${lines.join("\n")}</span>`);
    } else {
      this.addOutput(
        `<span class="error">head: ${fileName}: No such file</span>`
      );
    }
  }

  tail(params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">tail: missing file operand</span>`);
      return;
    }

    const fileName = params[0];
    const currentDir = this.getCurrentDirectory();

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === "file"
    ) {
      const content = currentDir.contents[fileName].content;
      const lines = content.split("\n").slice(-10);
      this.addOutput(`<span class="file">${lines.join("\n")}</span>`);
    } else {
      this.addOutput(
        `<span class="error">tail: ${fileName}: No such file</span>`
      );
    }
  }
  curl(params) {
    if (params.length === 0) {
      this.addOutput(
        `<span class="error">curl: missing URL or file name</span>`
      );
      return;
    }

    if (params[0] === "-O" && params[1] === "resume.pdf") {
      // Simulate download of resume.pdf
      const currentDir = this.getCurrentDirectory();
      if (currentDir.contents["resume.pdf"]) {
        // Create a Blob and trigger download
        const link = document.createElement("a");
        link.href = "Vaishnav_Resume.pdf"; // Assumes resume.pdf is in the public root
        link.download = "Vaishnav_Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.addOutput(`<span class="success">Downloaded resume.pdf</span>`);
      } else {
        this.addOutput(
          `<span class="error">curl: resume.pdf: No such file</span>`
        );
      }
    } else {
      this.addOutput(
        `<span class="error">curl: only 'curl -O resume.pdf' is supported</span>`
      );
    }
  }

  autoComplete(input) {
    const value = input.value;
    const parts = value.split(" ");
    const lastPart = parts[parts.length - 1];

    if (parts.length === 1) {
      // Auto-complete commands
      const commands = Object.keys(this.commands);
      const matches = commands.filter((cmd) => cmd.startsWith(lastPart));

      if (matches.length === 1) {
        input.value = matches[0];
      } else if (matches.length > 1) {
        this.addOutput(`<span class="info">${matches.join("  ")}</span>`);
        this.addNewPrompt();
      }
    } else {
      // Auto-complete file/directory names
      const currentDir = this.getCurrentDirectory();
      if (currentDir && currentDir.type === "directory") {
        const items = Object.keys(currentDir.contents);
        const matches = items.filter((item) => item.startsWith(lastPart));

        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          input.value = parts.join(" ");
        } else if (matches.length > 1) {
          this.addOutput(`<span class="info">${matches.join("  ")}</span>`);
          this.addNewPrompt();
        }
      }
    }
  }
}

// Initialize terminal when page loads
document.addEventListener("DOMContentLoaded", () => {
  new Terminal();
});
