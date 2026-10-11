// Swizzled to register the site's `custom-*` navbar item types alongside
// the defaults. Anything else is delegated to the original ComponentTypes map.

import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import GitHubStarsLink from './GitHubStarsLink';
import PlaybackSettingsNavbarItem from './PlaybackSettingsNavbarItem';

export default {
  ...ComponentTypes,
  'custom-githubStarsLink': GitHubStarsLink,
  'custom-playbackSettings': PlaybackSettingsNavbarItem,
};
