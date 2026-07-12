import { ArrowDownRight, ArrowUpRight, Check, Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '@/data/profile';
import { architectureNodes, labStack } from '../labData';

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

export function EditorialVariant() {
  return (
    <div className="lab-page lab-editorial">
      <header className="editorial-masthead">
        <a href="#editorial-title" className="editorial-wordmark">IDAN BOTBOL®</a>
        <p>Cloud architecture / platform engineering / backend systems</p>
        <nav aria-label="Editorial concept navigation">
          <a href="#editorial-work">Work</a>
          <a href="#editorial-stack">Stack</a>
          <a href="#editorial-contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="editorial-hero" aria-labelledby="editorial-title">
          <div className="editorial-hero-index">PORTFOLIO / 26</div>
          <div className="editorial-hero-copy">
            <p>{profile.role}</p>
            <h1 id="editorial-title">Idan<br />Botbol</h1>
            <div className="editorial-intro">
              <strong>Cloud systems, made legible.</strong>
              <p>
                I connect architecture, infrastructure, and backend realities to build platforms
                teams can understand and operate.
              </p>
            </div>
          </div>

          <div className="editorial-diagram" aria-label="Cloud delivery architecture illustration">
            <div className="editorial-diagram-axis editorial-diagram-axis--horizontal" />
            <div className="editorial-diagram-axis editorial-diagram-axis--vertical" />
            {architectureNodes.map((node, index) => (
              <div
                key={node.label}
                className={`editorial-node editorial-node--${index + 1}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <i />
                <strong>{node.label}</strong>
                <span>{node.detail}</span>
              </div>
            ))}
            <div className="editorial-diagram-caption">
              <span>REFERENCE ARCHITECTURE</span>
              <b>secure / observable / repeatable</b>
            </div>
          </div>

          <a className="editorial-hero-link" href="#editorial-work">
            Selected record <ArrowDownRight size={20} aria-hidden />
          </a>
        </section>

        <section className="editorial-thesis">
          <p>01 / POSITION</p>
          <h2>
            Developer velocity and operational stability are not opposing goals. Good platforms
            make both ordinary.
          </h2>
          <div>
            <span>Architecture reviews</span>
            <span>Modernization planning</span>
            <span>Infrastructure as code</span>
            <span>Production debugging</span>
          </div>
        </section>

        <section id="editorial-work" className="editorial-work">
          <header className="editorial-section-title">
            <p>02 / EXPERIENCE</p>
            <h2>Professional record</h2>
            <span>2021—PRESENT</span>
          </header>
          <div className="editorial-work-list">
            {profile.experience.map((role, index) => (
              <article key={role.hash}>
                <span className="editorial-role-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="editorial-role-title">
                  <h3>{role.msg.replace(/^(feat|docs|init):\s*/, '')}</h3>
                  <p>{role.company}</p>
                </div>
                <p className="editorial-role-summary">{role.summary}</p>
                <time>{role.date}</time>
              </article>
            ))}
          </div>
        </section>

        <section id="editorial-stack" className="editorial-stack">
          <header className="editorial-section-title">
            <p>03 / CAPABILITIES</p>
            <h2>Working stack</h2>
            <span>{labStack.length} SELECTED TOOLS</span>
          </header>
          <ol>
            {labStack.map((technology, index) => (
              <li key={technology}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{technology}</strong>
                <Check size={15} aria-hidden />
              </li>
            ))}
          </ol>
        </section>

        <section className="editorial-certification">
          <p>VERIFIED / GOOGLE CLOUD</p>
          <div>
            <h2>Professional Cloud Architect</h2>
            <span>Valid through {profile.certification.expiresLabel}</span>
          </div>
          <a href={profile.certification.credlyUrl} target="_blank" rel="noreferrer">
            View credential <ArrowUpRight size={17} aria-hidden />
          </a>
        </section>
      </main>

      <footer id="editorial-contact" className="editorial-footer">
        <div>
          <p>04 / CONTACT</p>
          <h2>Build the next reliable system.</h2>
        </div>
        <div className="editorial-socials" aria-label="Social profiles">
          {profile.socials.map((social) => {
            const Icon = socialIcons[social.kind];
            return (
              <a
                key={social.kind}
                href={social.href}
                target={social.kind === 'email' ? undefined : '_blank'}
                rel={social.kind === 'email' ? undefined : 'noreferrer'}
              >
                <Icon size={18} aria-hidden /> {social.label}
              </a>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
