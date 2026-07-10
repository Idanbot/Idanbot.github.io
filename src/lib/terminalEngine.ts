import { profile } from '@/data/profile';
import { siteLinks } from '@/data/siteActions';
import { formatHeartbeatSummary, type HeartbeatMachine } from './heartbeats';

export const TERMINAL_COMMANDS = [
  'about',
  'btop',
  'cat',
  'clear',
  'curl',
  'date',
  'echo',
  'exit',
  'heartbeat',
  'help',
  'htop',
  'joke',
  'ls',
  'man',
  'mkdir',
  'neofetch',
  'nvim',
  'ping',
  'pwd',
  'repo',
  'rev',
  'rm',
  'skills',
  'sudo',
  'tmux',
  'touch',
  'uname',
  'uptime',
  'vi',
  'vim',
  'weather',
  'whoami',
].sort((first, second) => first.localeCompare(second));

export const VIRTUAL_FILES = ['contact.md', 'roadmap.txt'].sort((first, second) =>
  first.localeCompare(second)
);

export type TerminalEffect =
  | { type: 'clear' }
  | { type: 'close' }
  | { type: 'open-monitor' }
  | { type: 'open-url'; href: string };

export interface TerminalExecution {
  output?: string;
  effect?: TerminalEffect;
  recordHistory: boolean;
}

export interface TerminalCompletion {
  input: string;
  nextCycle: number;
}

export interface TerminalRuntime {
  now: () => Date;
  uptimeSeconds: () => number;
  userAgent: () => string;
  logicalCores: () => number;
  memory: () => { usedBytes: number; limitBytes: number } | undefined;
  random: () => number;
  fetchHeartbeats: () => Promise<HeartbeatMachine[]>;
}

export interface TerminalEngine {
  execute: (input: string) => Promise<TerminalExecution | null>;
  complete: (input: string, cycle?: number) => TerminalCompletion;
  pendingMessage: (input: string) => string | undefined;
}

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  'I would tell you a UDP joke, but you might not get it.',
  "There are 10 types of people in the world: those who understand binary, and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
  "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
  "Why do Java developers wear glasses? Because they don't C#.",
  "What is a DevOps engineer's favorite hangout place? The cloud.",
  'Why did the developer go broke? Because he used up all his cache.',
  'How do you comfort a JavaScript bug? You console it.',
  'What did the router say to the doctor? It hurts when IP.',
  "Why don't programmers like nature? It has too many bugs.",
  "What's a Linux user's favorite game? sudo ku.",
  'What did the server say to the client? 200 OK.',
  'Why did the edge server go bankrupt? Because it lost its content.',
  'Parallel lines have so much in common. It is a shame they will never meet.',
];

function longestCommonPrefix(values: string[]) {
  if (values.length === 0) return '';
  const first = values[0];
  for (let index = 0; index < first.length; index += 1) {
    const character = first[index];
    if (values.some((value) => value[index] !== character)) return first.slice(0, index);
  }
  return first;
}

function completeFromList({
  prefix,
  partial,
  values,
  cycle,
  appendSpace,
}: {
  prefix: string;
  partial: string;
  values: string[];
  cycle: number;
  appendSpace: boolean;
}): TerminalCompletion {
  const matches = values.filter((value) => value.toLowerCase().startsWith(partial.toLowerCase()));
  if (matches.length === 0) return { input: `${prefix}${partial}`, nextCycle: 0 };
  if (matches.length === 1) {
    return { input: `${prefix}${matches[0]}${appendSpace ? ' ' : ''}`, nextCycle: 0 };
  }

  const commonPrefix = longestCommonPrefix(matches);
  if (commonPrefix.length > partial.length) {
    return { input: `${prefix}${commonPrefix}`, nextCycle: 0 };
  }

  const index = cycle % matches.length;
  return {
    input: `${prefix}${matches[index]}${appendSpace ? ' ' : ''}`,
    nextCycle: index + 1,
  };
}

function getClientDescription(userAgent: string) {
  if (userAgent.includes('Macintosh')) return { os: 'macOS (Darwin)', shell: 'zsh (iterm)' };
  if (userAgent.includes('Windows')) return { os: 'Windows (WSL)', shell: 'powershell' };
  if (userAgent.includes('Android')) return { os: 'Android (Linux)', shell: 'sh (termux)' };
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return { os: 'iOS (Darwin)', shell: 'bash' };
  }
  return { os: 'Linux x86_64', shell: 'zsh 5.8' };
}

function isValidPingTarget(target: string) {
  const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(target);
  const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(
    target
  );
  const reservedTargets = ['localhost', '127.0.0.1', '0.0.0.0', '255.255.255.255'];
  return { valid: isIp || isDomain || reservedTargets.includes(target), isIp };
}

export function createTerminalEngine(runtime: TerminalRuntime): TerminalEngine {
  const domainIpMap = new Map<string, string>();

  const execute = async (input: string): Promise<TerminalExecution | null> => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return null;

    const [rawCommand, ...args] = trimmedInput.split(/\s+/);
    const command = rawCommand.toLowerCase();
    const argsString = args.join(' ');
    let output: string;
    let effect: TerminalEffect | undefined;

    switch (command) {
      case 'help':
        output = `Available commands: ${TERMINAL_COMMANDS.join(', ')}\nTip: press Tab to complete commands and \`cat\` filenames. Run \`heartbeat -json\` for the raw heartbeat endpoint response.`;
        break;
      case 'heartbeat':
        try {
          const machines = await runtime.fetchHeartbeats();
          output = args.includes('-json')
            ? JSON.stringify(machines, null, 2)
            : formatHeartbeatSummary(machines);
        } catch (error) {
          output = `heartbeat: ${error instanceof Error ? error.message : 'request failed'}`;
        }
        break;
      case 'echo':
        output = argsString;
        break;
      case 'tmux':
      case 'nvim':
      case 'vim':
      case 'vi':
      case 'htop':
      case 'btop':
        output = 'Starting session...';
        effect = { type: 'open-monitor' };
        break;
      case 'about':
        output = `${profile.name}: ${profile.role} at ${profile.experience[0].company}, with backend depth and hands-on GCP, AWS, Kubernetes, Terraform, CI/CD, observability, and production cloud systems.`;
        break;
      case 'skills':
        output =
          'STACK: GCP, AWS, GKE, Kubernetes, Terraform, IAM, Networking, Cloud SQL, Secret Manager, Artifact Registry, CI/CD, Observability, Cost Optimization, Linux, Bash, Python, Java, Spring Boot, REST APIs, PostgreSQL, RabbitMQ, Kafka, Prometheus, Grafana, Datadog';
        break;
      case 'cat':
        if (args[0] === 'contact.md') {
          output = `Email: ${siteLinks.email.replace('mailto:', '')} | GitHub: ${siteLinks.github}`;
        } else if (args[0] === 'roadmap.txt') {
          output = `${profile.certification.name} - see Stack section + Credly badge link for verification.`;
        } else {
          const name = args[0] || '(missing path)';
          output = `cat: ${name}: No such file or directory\nHint: try \`cat contact.md\` or \`cat roadmap.txt\`.`;
        }
        break;
      case 'whoami':
        output = 'root';
        break;
      case 'sudo':
        output = 'user is not in the sudoers file. This incident will be reported.';
        break;
      case 'uptime':
        output = `up ${Math.floor(runtime.uptimeSeconds())} seconds, 1 user, load average: 0.00, 0.01, 0.05`;
        break;
      case 'ping': {
        const target = args[0];
        if (!target) {
          output = 'ping: usage error: Destination address required';
          break;
        }

        const { valid, isIp } = isValidPingTarget(target);
        if (!valid) {
          output = `ping: ${target}: Name or service not known`;
          break;
        }

        let ip = target;
        if (!isIp) {
          const cachedIp = domainIpMap.get(target);
          ip =
            cachedIp ??
            Array.from({ length: 4 }, () => Math.floor(runtime.random() * 255)).join('.');
          domainIpMap.set(target, ip);
        }

        const pings = [1, 2, 3, 4]
          .map((sequence) => {
            const time = (runtime.random() * 40 + 10).toFixed(1);
            return `64 bytes from ${ip}: icmp_seq=${sequence} ttl=114 time=${time} ms`;
          })
          .join('\n');
        const stats = `\n--- ${target} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nrtt min/avg/max/mdev = 10.2/25.4/48.1/12.3 ms`;
        output = `PING ${target} (${ip}): 56 data bytes\n${pings}${stats}`;
        break;
      }
      case 'weather':
        output = 'Cloudy with a chance of serverless functions.';
        break;
      case 'date':
        output = runtime.now().toString();
        break;
      case 'pwd':
        output = '/home/idan/portfolio';
        break;
      case 'ls':
        output = args.includes('-a')
          ? '.  ..  .config  contact.md  roadmap.txt'
          : 'contact.md  roadmap.txt';
        break;
      case 'repo':
        output = 'Opening GitHub repository...';
        effect = { type: 'open-url', href: siteLinks.repository };
        break;
      case 'man':
        output = 'What manual? You are the manual.';
        break;
      case 'uname':
        output = args.includes('-a')
          ? 'Linux idan-portfolio 5.15.0-100-generic #1 SMP Mon Oct 25 10:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux'
          : 'Linux';
        break;
      case 'neofetch': {
        const client = getClientDescription(runtime.userAgent());
        const memory = runtime.memory();
        const memoryDescription = memory
          ? `${Math.round(memory.usedBytes / (1024 * 1024))}MB / ${Math.round(memory.limitBytes / (1024 * 1024))}MB (JS Heap)`
          : '512MB / 4096MB (JS Heap)';
        output = `
       .---.
      /     \\      OS: ${client.os}
      |  O  |      Host: Browser Session
      \\  _  /      Kernel: 5.15.0-browser
       '.___.'     Uptime: ${Math.floor(runtime.uptimeSeconds() / 60)} mins
                   Packages: 42 (npm-deps)
                   Shell: ${client.shell}
                   Theme: Cyber-Tokyo [GTK3]
                   Icons: Tokyo-Night [GTK3]
                   Terminal: IdanTerm
                   CPU: ${runtime.logicalCores()}x Logical Cores
                   Memory: ${memoryDescription}
        `;
        break;
      }
      case 'curl':
        output = args[0]
          ? `curl: (6) Could not resolve host: ${args[0]}`
          : "curl: try 'curl --help' or 'curl --manual' for more information";
        break;
      case 'rev':
        output = argsString.split('').reverse().join('');
        break;
      case 'joke':
        output = jokes[Math.floor(runtime.random() * jokes.length)];
        break;
      case 'mkdir':
        output = `mkdir: cannot create directory '${args[0] || ''}': Permission denied`;
        break;
      case 'touch':
        output = `touch: cannot touch '${args[0] || ''}': Permission denied`;
        break;
      case 'rm':
        output =
          args.includes('-rf') && (args.includes('/') || args.includes('*'))
            ? 'Nice try, but I cannot let you do that, Dave.'
            : `rm: cannot remove '${args[0] || ''}': Permission denied`;
        break;
      case 'clear':
        return { effect: { type: 'clear' }, recordHistory: false };
      case 'exit':
        return { effect: { type: 'close' }, recordHistory: false };
      default:
        output = `Command not found: ${command}. Type \`help\` to see what this shell understands, or try \`skills\` / \`about\`.`;
    }

    return { output, effect, recordHistory: true };
  };

  const complete = (input: string, cycle = 0): TerminalCompletion => {
    const catFile = input.match(/^(\s*cat\s+)(\S*)$/i);
    if (catFile) {
      return completeFromList({
        prefix: catFile[1],
        partial: catFile[2],
        values: VIRTUAL_FILES,
        cycle,
        appendSpace: false,
      });
    }

    const commandOnly = input.match(/^(\s*)(\S*)$/);
    if (!commandOnly) return { input, nextCycle: 0 };
    return completeFromList({
      prefix: commandOnly[1],
      partial: commandOnly[2],
      values: TERMINAL_COMMANDS,
      cycle,
      appendSpace: true,
    });
  };

  return {
    execute,
    complete,
    pendingMessage: (input) =>
      input.trim().split(/\s+/, 1)[0]?.toLowerCase() === 'heartbeat'
        ? 'Fetching heartbeat machines...'
        : undefined,
  };
}
