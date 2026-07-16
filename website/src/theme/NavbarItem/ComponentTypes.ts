// Swizzled to register a `custom-githubStarsLink` navbar item type alongside
// the defaults. Anything else is delegated to the original ComponentTypes map.

import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import GitHubStarsLink from './GitHubStarsLink';

export default {
  ...ComponentTypes,
  'custom-githubStarsLink': GitHubStarsLink,
};
