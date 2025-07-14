class Terminal {
  constructor () {
    this.currentPath = ''
    this.userName = ''
    this.hostName = ''
    this.history = []
    this.historyIndex = -1
    this.fileSystem = {}
    this.isLoading = true

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
      curl: this.curl.bind(this)
    }

    this.loadPortfolioData()
  }

  async loadPortfolioData () {
    try {
      const response = await fetch('portfolio-data.json')
      const data = await response.json()

      this.userName = data.user.name
      this.hostName = data.user.hostname
      this.currentPath = data.user.homePath
      this.fileSystem = this.expandFileSystem(data.fileSystem)
      this.isLoading = false

      this.initializeTerminal()
    } catch (error) {
      console.error('Error loading portfolio data:', error)
      this.addOutput(
        `<span class="error">Error loading portfolio data. Please refresh the page.</span>`
      )
    }
  }

  expandFileSystem (fileSystem) {
    const expanded = {}

    function expandDirectory (path, contents) {
      expanded[path] = {
        type: 'directory',
        contents: {}
      }

      Object.keys(contents).forEach(name => {
        const item = contents[name]
        if (item.type === 'directory') {
          const subPath = path + '/' + name
          expanded[path].contents[name] = item
          expandDirectory(subPath, item.contents)
        } else {
          expanded[path].contents[name] = item
        }
      })
    }

    Object.keys(fileSystem).forEach(path => {
      expandDirectory(path, fileSystem[path].contents)
    })

    return expanded
  }

  initializeTerminal () {
    if (this.isLoading) return

    const input = document.getElementById('user-input')
    const content = document.getElementById('terminal-content')

    if (!input || !content) return

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const command = input.value.trim()
        if (command) {
          this.history.push(command)
          this.historyIndex = this.history.length
        }
        this.executeCommand(command)
        input.value = ''
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (this.historyIndex > 0) {
          this.historyIndex--
          input.value = this.history[this.historyIndex]
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++
          input.value = this.history[this.historyIndex]
        } else {
          this.historyIndex = this.history.length
          input.value = ''
        }
      } else if (e.key === 'Tab') {
        e.preventDefault()
        this.autoComplete(input)
      }
    })

    content.addEventListener('click', () => {
      input.focus()
    })

    this.scrollToBottom()
  }

  executeCommand (commandLine) {
    const args = commandLine.split(' ')
    const command = args[0]
    const params = args.slice(1)

    this.addOutput(
      `<span class="prompt">${this.getPrompt()}</span>${commandLine}`
    )

    if (this.commands[command]) {
      this.commands[command](params)
    } else if (command === '') {
      // Empty command, just show prompt
    } else {
      this.addOutput(`<span class="error">Command not found: ${command}</span>`)
      this.addOutput(
        `<span class="info">Type 'help' to see available commands</span>`
      )
    }

    this.addNewPrompt()
  }

  addOutput (text) {
    const content = document.getElementById('terminal-content')
    const output = document.createElement('div')
    output.className = 'output'
    output.innerHTML = text

    const currentInput = content.querySelector('.command-line')
    if (currentInput) {
      currentInput.remove()
    }

    content.appendChild(output)
    this.scrollToBottom()
  }

  addNewPrompt () {
    const content = document.getElementById('terminal-content')
    const promptLine = document.createElement('div')
    promptLine.className = 'command-line'
    promptLine.innerHTML = `
      <span class="prompt">${this.getPrompt()}</span>
      <input type="text" class="user-input" id="user-input" autofocus>
      <span class="cursor">█</span>
    `
    content.appendChild(promptLine)

    const newInput = document.getElementById('user-input')
    newInput.focus()

    this.initializeTerminal()
    this.scrollToBottom()
  }

  getPrompt () {
    const shortPath = this.currentPath.replace(`/home/${this.userName}`, '~')
    return `${this.userName}@${this.hostName}:${shortPath}$`
  }

  scrollToBottom () {
    const content = document.getElementById('terminal-content')
    content.scrollTop = content.scrollHeight
  }

  getCurrentDirectory () {
    return this.fileSystem[this.currentPath]
  }

  resolvePath (path) {
    if (path.startsWith('/')) {
      return path
    } else if (path === '..') {
      const parts = this.currentPath.split('/')
      parts.pop()
      return parts.join('/') || '/'
    } else if (path === '.') {
      return this.currentPath
    } else {
      return this.currentPath + '/' + path
    }
  }

  help () {
    const commands = [
      { cmd: 'help', desc: 'Show this help message' },
      { cmd: 'ls', desc: 'List directory contents' },
      { cmd: 'cd', desc: 'Change directory' },
      { cmd: 'cat', desc: 'Display file contents' },
      { cmd: 'pwd', desc: 'Print working directory' },
      { cmd: 'whoami', desc: 'Display current user' },
      { cmd: 'clear', desc: 'Clear terminal screen' },
      { cmd: 'tree', desc: 'Show directory tree' },
      { cmd: 'find', desc: 'Find files by name' },
      { cmd: 'grep', desc: 'Search text in files' },
      { cmd: 'history', desc: 'Show command history' },
      { cmd: 'date', desc: 'Show current date and time' },
      { cmd: 'echo', desc: 'Display text' },
      { cmd: 'wc', desc: 'Count lines, words, characters' },
      { cmd: 'head', desc: 'Show first lines of file' },
      { cmd: 'tail', desc: 'Show last lines of file' },
      { cmd: 'curl', desc: 'Download file' }
    ]

    let output = `<span class="success">Available Commands:</span>\n\n`
    output += '<div class="help-table">'

    commands.forEach(({ cmd, desc }) => {
      output += `<div class="help-row">
            <div class="help-command-cell"><span class="help-command">${cmd}</span></div>
            <div class="help-desc-cell">${desc}</div>
        </div>`
    })

    output += '</div>'

    output += `\n<span class="info">Navigation Tips:</span>
- Use 'ls' to see what's available
- Use 'cd projects' to explore my projects
- Use 'cat about.txt' to learn about me
- Use 'cat skills.conf' to see my technical skills
- Use Tab for auto-completion
- Use Up/Down arrows for command history`

    this.addOutput(output)
  }

  ls (params) {
    const currentDir = this.getCurrentDirectory()
    if (!currentDir || currentDir.type !== 'directory') {
      this.addOutput(`<span class="error">Not a directory</span>`)
      return
    }

    const items = Object.keys(currentDir.contents)
    if (items.length === 0) {
      this.addOutput(`<span class="info">Directory is empty</span>`)
      return
    }

    let output = ''
    items.forEach(item => {
      const itemObj = currentDir.contents[item]
      if (itemObj.type === 'directory') {
        output += `<span class="directory">${item}/</span>  `
      } else {
        output += `<span class="file">${item}</span>  `
      }
    })

    this.addOutput(output)
  }

  cd (params) {
    if (params.length === 0) {
      this.currentPath = `/home/${this.userName}`
      return
    }

    let targetPath
    if (params[0].startsWith('/')) {
      targetPath = params[0]
    } else if (params[0] === '..') {
      const parts = this.currentPath.split('/')
      parts.pop()
      targetPath = parts.join('/') || '/'
    } else if (params[0] === '.') {
      targetPath = this.currentPath
    } else {
      const currentDir = this.getCurrentDirectory()
      if (
        currentDir &&
        currentDir.contents[params[0]] &&
        currentDir.contents[params[0]].type === 'directory'
      ) {
        targetPath = this.currentPath + '/' + params[0]
      } else {
        this.addOutput(
          `<span class="error">cd: ${params[0]}: No such directory</span>`
        )
        return
      }
    }

    if (
      this.fileSystem[targetPath] &&
      this.fileSystem[targetPath].type === 'directory'
    ) {
      this.currentPath = targetPath
    } else {
      this.addOutput(
        `<span class="error">cd: ${params[0]}: No such directory</span>`
      )
    }
  }

  cat (params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">cat: missing file operand</span>`)
      return
    }

    const currentDir = this.getCurrentDirectory()
    const fileName = params[0]

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === 'file'
    ) {
      const content = currentDir.contents[fileName].content
      this.addOutput(`<span class="file">${content}</span>`)
    } else {
      this.addOutput(
        `<span class="error">cat: ${fileName}: No such file</span>`
      )
    }
  }

  pwd () {
    this.addOutput(`<span class="info">${this.currentPath}</span>`)
  }

  whoami () {
    this.addOutput(`<span class="success">${this.userName}</span>`)
  }

  clear () {
    const content = document.getElementById('terminal-content')
    content.innerHTML = ''
  }

  tree (params) {
    const showTree = (path, prefix = '', isLast = true) => {
      const dir = this.fileSystem[path]
      if (!dir || dir.type !== 'directory') return ''

      let result = ''
      const items = Object.keys(dir.contents)
      items.forEach((item, index) => {
        const isLastItem = index === items.length - 1
        const itemPath = path + '/' + item
        const itemObj = dir.contents[item]

        const connector = isLastItem ? '└── ' : '├── '
        const color = itemObj.type === 'directory' ? 'directory' : 'file'

        result += `${prefix}${connector}<span class="${color}">${item}</span>\n`

        if (itemObj.type === 'directory') {
          const nextPrefix = prefix + (isLastItem ? '    ' : '│   ')
          result += showTree(itemPath, nextPrefix, isLastItem)
        }
      })

      return result
    }

    const treeOutput = showTree(this.currentPath)
    this.addOutput(`<span class="directory">.</span>\n${treeOutput}`)
  }

  find (params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">find: missing argument</span>`)
      return
    }

    const searchTerm = params[0]
    const findInDirectory = path => {
      const dir = this.fileSystem[path]
      if (!dir || dir.type !== 'directory') return []

      let results = []
      Object.keys(dir.contents).forEach(item => {
        const itemPath = path + '/' + item
        if (item.includes(searchTerm)) {
          results.push(itemPath)
        }

        if (dir.contents[item].type === 'directory') {
          results = results.concat(findInDirectory(itemPath))
        }
      })

      return results
    }

    const results = findInDirectory(this.currentPath)
    if (results.length === 0) {
      this.addOutput(
        `<span class="warning">No files found matching '${searchTerm}'</span>`
      )
    } else {
      results.forEach(result => {
        this.addOutput(`<span class="info">${result}</span>`)
      })
    }
  }

  grep (params) {
    if (params.length < 2) {
      this.addOutput(
        `<span class="error">grep: usage: grep pattern file</span>`
      )
      return
    }

    const pattern = params[0]
    const fileName = params[1]
    const currentDir = this.getCurrentDirectory()

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === 'file'
    ) {
      const content = currentDir.contents[fileName].content
      const lines = content.split('\n')
      const matches = lines.filter(line =>
        line.toLowerCase().includes(pattern.toLowerCase())
      )

      if (matches.length === 0) {
        this.addOutput(
          `<span class="warning">No matches found for '${pattern}'</span>`
        )
      } else {
        matches.forEach(match => {
          const highlighted = match.replace(
            new RegExp(`(${pattern})`, 'gi'),
            `<span class="warning">$1</span>`
          )
          this.addOutput(`<span class="info">${highlighted}</span>`)
        })
      }
    } else {
      this.addOutput(
        `<span class="error">grep: ${fileName}: No such file</span>`
      )
    }
  }

  showHistory () {
    if (this.history.length === 0) {
      this.addOutput(`<span class="info">No commands in history</span>`)
      return
    }

    this.history.forEach((cmd, index) => {
      this.addOutput(`<span class="info">${index + 1}  ${cmd}</span>`)
    })
  }

  date () {
    const now = new Date()
    this.addOutput(`<span class="success">${now.toString()}</span>`)
  }

  echo (params) {
    const text = params.join(' ')
    this.addOutput(`<span class="info">${text}</span>`)
  }

  wc (params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">wc: missing file operand</span>`)
      return
    }

    const fileName = params[0]
    const currentDir = this.getCurrentDirectory()

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === 'file'
    ) {
      const content = currentDir.contents[fileName].content
      const lines = content.split('\n').length
      const words = content.split(/\s+/).filter(w => w.length > 0).length
      const chars = content.length

      this.addOutput(
        `<span class="info">  ${lines}  ${words}  ${chars} ${fileName}</span>`
      )
    } else {
      this.addOutput(`<span class="error">wc: ${fileName}: No such file</span>`)
    }
  }

  head (params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">head: missing file operand</span>`)
      return
    }

    const fileName = params[0]
    const currentDir = this.getCurrentDirectory()

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === 'file'
    ) {
      const content = currentDir.contents[fileName].content
      const lines = content.split('\n').slice(0, 10)
      this.addOutput(`<span class="file">${lines.join('\n')}</span>`)
    } else {
      this.addOutput(
        `<span class="error">head: ${fileName}: No such file</span>`
      )
    }
  }

  tail (params) {
    if (params.length === 0) {
      this.addOutput(`<span class="error">tail: missing file operand</span>`)
      return
    }

    const fileName = params[0]
    const currentDir = this.getCurrentDirectory()

    if (
      currentDir.contents[fileName] &&
      currentDir.contents[fileName].type === 'file'
    ) {
      const content = currentDir.contents[fileName].content
      const lines = content.split('\n').slice(-10)
      this.addOutput(`<span class="file">${lines.join('\n')}</span>`)
    } else {
      this.addOutput(
        `<span class="error">tail: ${fileName}: No such file</span>`
      )
    }
  }

  curl (params) {
    if (params.length === 0) {
      this.addOutput(
        `<span class="error">curl: missing URL or file name</span>`
      )
      return
    }

    if (params[0] === '-O' && params[1] === 'resume.pdf') {
      const currentDir = this.getCurrentDirectory()
      if (currentDir.contents['resume.pdf']) {
        const link = document.createElement('a')
        link.href = 'Vaishnav_Resume.pdf'
        link.download = 'Vaishnav_Resume.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.addOutput(`<span class="success">Downloaded resume.pdf</span>`)
      } else {
        this.addOutput(
          `<span class="error">curl: resume.pdf: No such file</span>`
        )
      }
    } else {
      this.addOutput(
        `<span class="error">curl: only 'curl -O resume.pdf' is supported</span>`
      )
    }
  }

  autoComplete (input) {
    const value = input.value
    const parts = value.split(' ')
    const lastPart = parts[parts.length - 1]

    if (parts.length === 1) {
      // Auto-complete commands
      const commands = Object.keys(this.commands)
      const matches = commands.filter(cmd => cmd.startsWith(lastPart))

      if (matches.length === 1) {
        input.value = matches[0]
      } else if (matches.length > 1) {
        this.addOutput(`<span class="info">${matches.join('  ')}</span>`)
        this.addNewPrompt()
      }
    } else {
      // Auto-complete file/directory names
      const currentDir = this.getCurrentDirectory()
      if (currentDir && currentDir.type === 'directory') {
        const items = Object.keys(currentDir.contents)
        const matches = items.filter(item => item.startsWith(lastPart))

        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0]
          input.value = parts.join(' ')
        } else if (matches.length > 1) {
          this.addOutput(`<span class="info">${matches.join('  ')}</span>`)
          this.addNewPrompt()
        }
      }
    }
  }

  showBootSequence () {
    const systemInfo = `
      System Information:
      ==================
      OS: Portfolio Linux 2.0
      Uptime: 2+ years in software engineering
      Memory: Full-stack development skills loaded
      Shell: /bin/vaishnav

      Status: Ready for new opportunities
      Location: Kerala, India`

    // Create ASCII art element
    const asciiElement = document.createElement('pre')
    asciiElement.className = 'ascii-art'
    asciiElement.style.color = '#00ff00'
    asciiElement.style.textShadow = '0 0 5px #00ff00'

    // Create system info element
    const systemElement = document.createElement('div')
    systemElement.className = 'output'
    systemElement.style.color = '#8be9fd'

    const content = document.getElementById('terminal-content')
    content.appendChild(asciiElement)
    content.appendChild(systemElement)

    // Then type system info (medium speed)
    setTimeout(() => {
      typeWriter(systemInfo, systemElement, 10)
    }, 1000)

    // Finally initialize terminal
    setTimeout(() => {
      this.isLoading = false
      this.addOutput(
        `<span class="success">Terminal initialized. Type 'help' for available commands.</span>`
      )
      this.addNewPrompt()
    }, 5500)
  }

  // Replace your existing loadPortfolioData method's end with this:
  async loadPortfolioData () {
    try {
      const response = await fetch('portfolio-data.json')
      const data = await response.json()

      this.userName = data.user.name
      this.hostName = data.user.hostname
      this.currentPath = data.user.homePath
      this.fileSystem = this.expandFileSystem(data.fileSystem)

      // Show boot sequence with typewriter effect
      this.showBootSequence()
    } catch (error) {
      console.error('Error loading portfolio data:', error)
      this.addOutput(
        `<span class="error">Error loading portfolio data. Please refresh the page.</span>`
      )
    }
  }

  addOutputWithTypewriter (text, speed = 20) {
    const content = document.getElementById('terminal-content')
    const output = document.createElement('div')
    output.className = 'output'

    const currentInput = content.querySelector('.command-line')
    if (currentInput) {
      currentInput.remove()
    }

    content.appendChild(output)
    typeWriter(text, output, speed)

    setTimeout(() => {
      this.scrollToBottom()
    }, text.length * speed + 100)
  }
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Terminal()
})

function typeWriter (text, element, speed = 20) {
  let i = 0
  element.innerHTML = ''

  function type () {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    }
  }
  type()
}
