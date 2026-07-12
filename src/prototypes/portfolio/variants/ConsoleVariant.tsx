import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CloudCog,
  Github,
  Linkedin,
  Mail,
  Network,
  Radio,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { profile } from '@/data/profile';
import { AmbientField } from '../AmbientField';
import { labStack } from '../labData';

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

const consoleSignals = [
  { label: 'Cloud plane', value: 'GCP + AWS', Icon: CloudCog, tone: 'cyan' },
  { label: 'Runtime', value: 'GKE / K8s', Icon: Network, tone: 'green' },
  { label: 'Delivery', value: 'IaC + CI/CD', Icon: Activity, tone: 'amber' },
  { label: 'Credential', value: 'PCA verified', Icon: ShieldCheck, tone: 'white' },
] as const;

export function ConsoleVariant() {
  return (
    <div className="lab-page lab-console">
      <header className="console-header">
        <a href="#console-title" className="console-brand"><TerminalSquare size={16} aria-hidden /> IB/CONTROL</a>
        <div className="console-environment"><i /> PORTFOLIO ENVIRONMENT / LOCAL</div>
        <nav aria-label="Control plane concept navigation">
          <a href="#console-record">LOG</a>
          <a href="#console-stack">STACK</a>
          <a href="#console-contact">COMMS</a>
        </nav>
      </header>

      <main>
        <section className="console-dashboard" aria-labelledby="console-title">
          <article className="console-pane console-identity">
            <div className="console-pane-label"><span>01</span> OPERATOR PROFILE</div>
            <p className="console-command">$ whoami --verbose</p>
            <h1 id="console-title">Idan Botbol</h1>
            <p className="console-role">{profile.role}</p>
            <p className="console-description">
              Cloud architecture with backend depth. Secure platforms, practical automation, and
              reliable production systems.
            </p>
            <div className="console-availability"><Radio size={14} aria-hidden /> {profile.availability}</div>
            <div className="console-socials" aria-label="Social profiles">
              {profile.socials.map((social) => {
                const Icon = socialIcons[social.kind];
                return (
                  <a
                    key={social.kind}
                    href={social.href}
                    target={social.kind === 'email' ? undefined : '_blank'}
                    rel={social.kind === 'email' ? undefined : 'noreferrer'}
                    aria-label={social.label}
                    title={social.label}
                  >
                    <Icon size={17} aria-hidden />
                  </a>
                );
              })}
            </div>
          </article>

          <article className="console-pane console-map">
            <div className="console-pane-label"><span>02</span> SYSTEM TOPOLOGY</div>
            <AmbientField mode="orbits" />
            <div className="console-map-legend">
              <span><i className="green" /> AVAILABLE</span>
              <span><i className="cyan" /> CONNECTED</span>
              <span><i className="amber" /> DELIVERY</span>
            </div>
            <div className="console-map-center">IB</div>
          </article>

          <article className="console-pane console-current">
            <div className="console-pane-label"><span>03</span> CURRENT ASSIGNMENT</div>
            <p>ORGANIZATION</p>
            <h2>WideOps Ltd</h2>
            <strong>Google Cloud Premier Partner</strong>
            <dl>
              <div><dt>ROLE</dt><dd>Cloud Architect / DevOps Engineer</dd></div>
              <div><dt>STARTED</dt><dd>FEB 2026</dd></div>
              <div><dt>MODE</dt><dd>HYBRID / CUSTOMER-FACING</dd></div>
            </dl>
          </article>

          <article className="console-pane console-signals">
            <div className="console-pane-label"><span>04</span> CAPABILITY SIGNALS</div>
            <div className="console-signal-grid">
              {consoleSignals.map(({ label, value, Icon, tone }) => (
                <div key={label} className={`console-signal console-signal--${tone}`}>
                  <Icon size={18} aria-hidden />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section id="console-record" className="console-record">
          <header>
            <div><span>05</span> PROFESSIONAL LOG</div>
            <p>Showing {profile.experience.length} verified entries</p>
          </header>
          <div className="console-log-table" role="table" aria-label="Professional experience">
            <div className="console-log-row console-log-head" role="row">
              <span role="columnheader">HASH</span>
              <span role="columnheader">PERIOD</span>
              <span role="columnheader">EVENT</span>
              <span role="columnheader">ORGANIZATION</span>
              <span role="columnheader">STATE</span>
            </div>
            {profile.experience.map((role, index) => (
              <article className="console-log-row" role="row" key={role.hash}>
                <code role="cell">{role.hash}</code>
                <time role="cell">{role.date}</time>
                <strong role="cell">{role.msg.replace(/^(feat|docs|init):\s*/, '')}</strong>
                <span role="cell">{role.company}</span>
                <span role="cell" className={index === 0 ? 'console-state-active' : ''}>
                  <CheckCircle2 size={13} aria-hidden /> {index === 0 ? 'ACTIVE' : 'ARCHIVED'}
                </span>
                <p>{role.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="console-stack" className="console-stack">
          <header><span>06</span> LOADED MODULES</header>
          <div>
            {labStack.map((technology, index) => (
              <span key={technology}><i>{String(index + 1).padStart(2, '0')}</i>{technology}</span>
            ))}
          </div>
        </section>
      </main>

      <footer id="console-contact" className="console-footer">
        <div>
          <span>READY FOR INPUT</span>
          <p>$ contact idan --channel=email</p>
        </div>
        <a href={profile.socials.find((social) => social.kind === 'email')?.href}>
          OPEN CHANNEL <ArrowUpRight size={16} aria-hidden />
        </a>
      </footer>
    </div>
  );
}
