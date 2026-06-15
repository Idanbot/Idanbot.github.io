import { describe, expect, it } from 'vitest';
import { profile } from './profile';

describe('profile data', () => {
  it('keeps the current WideOps role first', () => {
    expect(profile.experience[0]).toMatchObject({
      company: 'WideOps Ltd',
      msg: 'feat: Cloud Architect / DevOps Engineer',
      date: 'Feb 2026 - Present',
    });
  });

  it('has unique social labels and links', () => {
    const labels = profile.socials.map((social) => social.label);
    const hrefs = profile.socials.map((social) => social.href);

    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('has usable certification dates', () => {
    expect(Date.parse(profile.certification.issued)).not.toBeNaN();
    expect(Date.parse(profile.certification.expires)).toBeGreaterThan(
      Date.parse(profile.certification.issued)
    );
  });
});
