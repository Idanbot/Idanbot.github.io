import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import { profile } from '@/data/profile';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { labStack, practiceAreas } from '../labData';

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

export function TerrainVariant() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="lab-page lab-terrain">
      <section className="terrain-hero" aria-labelledby="terrain-title">
        <HeroBackground quality="full" animate={!reducedMotion} />
        <header className="terrain-nav">
          <a className="terrain-monogram" href="#terrain-title" aria-label="Idan Botbol, top">
            IB<span>/26</span>
          </a>
          <nav aria-label="Terrain concept navigation">
            <a href="#terrain-practice">Practice</a>
            <a href="#terrain-record">Record</a>
            <a href="#terrain-contact">Contact</a>
          </nav>
          <span className="terrain-nav-status"><i /> Haifa, IL</span>
        </header>

        <div className="terrain-hero-layout">
          <div className="terrain-hero-copy">
            <p className="terrain-kicker">Cloud architect / backend engineer</p>
            <h1 id="terrain-title">Idan Botbol</h1>
            <p className="terrain-statement">
              I architect <strong>resilient cloud systems</strong> with the practical depth to
              debug what happens after deployment.
            </p>
            <div className="terrain-actions">
              <a className="terrain-primary-action" href="#terrain-record">
                Explore my trajectory <ArrowDown size={16} aria-hidden />
              </a>
              <div className="terrain-socials" aria-label="Social profiles">
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
            </div>
          </div>

          <aside className="terrain-deployment" aria-label="Current role">
            <p>Current deployment</p>
            <strong>WideOps Ltd</strong>
            <span>Cloud Architect / DevOps Engineer</span>
            <dl>
              <div><dt>Clouds</dt><dd>GCP + AWS</dd></div>
              <div><dt>Focus</dt><dd>Platforms</dd></div>
              <div><dt>Mode</dt><dd>Customer-facing</dd></div>
            </dl>
          </aside>
        </div>

        <div className="terrain-hero-foot">
          {profile.signals.map((signal, index) => (
            <span key={signal}><b>0{index + 1}</b>{signal}</span>
          ))}
        </div>
      </section>

      <main>
        <section id="terrain-practice" className="terrain-practice">
          <header className="terrain-section-heading">
            <p>Operating model</p>
            <h2>Architecture that survives contact with production.</h2>
          </header>
          <div className="terrain-practice-grid">
            {practiceAreas.map((area) => (
              <article key={area.index}>
                <span>{area.index}</span>
                <h3>{area.title}</h3>
                <p>{area.body}</p>
              </article>
            ))}
          </div>
          <div className="terrain-stack-line" aria-label="Selected technology stack">
            {labStack.map((technology) => <span key={technology}>{technology}</span>)}
          </div>
        </section>

        <section id="terrain-record" className="terrain-record">
          <header className="terrain-section-heading terrain-section-heading--split">
            <div>
              <p>Selected record</p>
              <h2>Systems experience, commit by commit.</h2>
            </div>
            <p className="terrain-section-note">
              Backend foundations evolved into cloud architecture, platform engineering, and
              customer-facing technical discovery.
            </p>
          </header>

          <div className="terrain-timeline">
            {profile.experience.slice(0, 4).map((role, index) => (
              <article key={role.hash}>
                <div className="terrain-timeline-index">0{index + 1}</div>
                <div className="terrain-timeline-meta">
                  <span>{role.date}</span>
                  <small>{role.tag}</small>
                </div>
                <div className="terrain-timeline-role">
                  <h3>{role.msg.replace(/^(feat|docs|init):\s*/, '')}</h3>
                  <p>{role.company}</p>
                </div>
                <p className="terrain-timeline-summary">{role.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="terrain-credential">
          <ShieldCheck aria-hidden />
          <div>
            <p>Verified credential</p>
            <h2>{profile.certification.name}</h2>
            <span>Valid through {profile.certification.expiresLabel}</span>
          </div>
          <a href={profile.certification.credlyUrl} target="_blank" rel="noreferrer">
            Verify <ArrowUpRight size={16} aria-hidden />
          </a>
        </section>
      </main>

      <footer id="terrain-contact" className="terrain-footer">
        <p>Have a cloud or platform problem worth untangling?</p>
        <a href={profile.socials.find((social) => social.kind === 'email')?.href}>Start a conversation</a>
        <span>Idan Botbol / 2026</span>
      </footer>
    </div>
  );
}
