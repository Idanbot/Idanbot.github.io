import {
  ArrowRight,
  ArrowUpRight,
  Cloud,
  Github,
  Linkedin,
  Mail,
  Network,
  Shield,
} from 'lucide-react';
import { profile } from '@/data/profile';
import { AmbientField } from '../AmbientField';
import { labStack, practiceAreas } from '../labData';

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
} as const;

export function CinematicVariant() {
  return (
    <div className="lab-page lab-cinematic">
      <section className="cinematic-hero" aria-labelledby="cinematic-title">
        <AmbientField mode="ribbons" />
        <div className="cinematic-veil" aria-hidden />
        <div className="cinematic-pulses" aria-hidden>
          {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
        </div>

        <header className="cinematic-nav cinematic-glass">
          <a className="cinematic-brand" href="#cinematic-title">
            <span>IB</span> Idan Botbol
          </a>
          <nav aria-label="Cinematic concept navigation">
            <a href="#cinematic-expertise">Expertise</a>
            <a href="#cinematic-experience">Experience</a>
            <a href="#cinematic-contact">Contact</a>
          </nav>
          <a className="cinematic-nav-cta" href="#cinematic-contact">Connect <ArrowUpRight size={14} aria-hidden /></a>
        </header>

        <div className="cinematic-copy">
          <p className="cinematic-availability"><i /> {profile.availability}</p>
          <h1 id="cinematic-title">Idan Botbol</h1>
          <p className="cinematic-headline">Cloud architecture, shaped for production.</p>
          <p className="cinematic-summary">
            Secure platforms, dependable delivery, and infrastructure decisions informed by
            hands-on backend engineering.
          </p>
          <div className="cinematic-actions">
            <a className="cinematic-primary" href="#cinematic-experience">
              View experience <ArrowRight size={16} aria-hidden />
            </a>
            <div className="cinematic-socials cinematic-glass" aria-label="Social profiles">
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

        <aside className="cinematic-focus cinematic-glass">
          <div className="cinematic-focus-top">
            <span>Active focus</span>
            <i>2026</i>
          </div>
          <strong>Cloud-native delivery</strong>
          <p>GCP / AWS / GKE / Terraform</p>
          <div className="cinematic-focus-meter"><span /></div>
          <small>Architecture · Platforms · FinOps</small>
        </aside>

        <div className="cinematic-bottom-rail">
          <span>Based in Haifa, Israel</span>
          <span>Google Cloud PCA</span>
          <span>Cloud / Platform / Backend</span>
        </div>
      </section>

      <main>
        <section id="cinematic-expertise" className="cinematic-expertise">
          <header>
            <p>01 / Expertise</p>
            <h2>From architecture review to the production signal.</h2>
          </header>
          <div className="cinematic-expertise-grid">
            {practiceAreas.map((area, index) => {
              const Icon = [Cloud, Network, Shield][index];
              return (
                <article key={area.index} className="cinematic-glass">
                  <Icon size={24} aria-hidden />
                  <span>{area.index}</span>
                  <h3>{area.title}</h3>
                  <p>{area.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="cinematic-stack" aria-labelledby="cinematic-stack-title">
          <div>
            <p>Selected stack</p>
            <h2 id="cinematic-stack-title">The tools are deliberate. The system is the product.</h2>
          </div>
          <ul>
            {labStack.map((technology, index) => (
              <li key={technology}><span>{String(index + 1).padStart(2, '0')}</span>{technology}</li>
            ))}
          </ul>
        </section>

        <section id="cinematic-experience" className="cinematic-experience">
          <header>
            <p>02 / Trajectory</p>
            <h2>Engineering breadth with a clear direction.</h2>
          </header>
          <div className="cinematic-role-list">
            {profile.experience.slice(0, 3).map((role) => (
              <article key={role.hash} className="cinematic-glass">
                <div>
                  <span>{role.date}</span>
                  <small>{role.hash}</small>
                </div>
                <div>
                  <h3>{role.msg.replace(/^(feat|docs|init):\s*/, '')}</h3>
                  <p>{role.company}</p>
                </div>
                <p>{role.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer id="cinematic-contact" className="cinematic-contact">
        <div>
          <span>Available for focused conversations</span>
          <h2>Let&apos;s make the architecture easier to trust.</h2>
        </div>
        <a href={profile.socials.find((social) => social.kind === 'email')?.href}>
          Send an email <Mail size={18} aria-hidden />
        </a>
      </footer>
    </div>
  );
}
