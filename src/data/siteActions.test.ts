import { describe, expect, it } from 'vitest';
import { SITE_SECTION_IDS, siteLinks, siteSections, socialActions } from './siteActions';

describe('site action catalog', () => {
  it('keeps the section order and labels in one typed catalog', () => {
    expect(siteSections.map((section) => section.id)).toEqual(SITE_SECTION_IDS);
    expect(siteSections.map((section) => section.label)).toEqual([
      'Profile',
      'Stack',
      'Experience',
      'Live',
    ]);
  });

  it('derives shared links from profile socials', () => {
    expect(siteLinks.github).toBe(
      socialActions.find((social) => social.kind === 'github')?.href
    );
    expect(siteLinks.email).toMatch(/^mailto:/);
  });
});
