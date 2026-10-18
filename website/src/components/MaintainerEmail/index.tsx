import React, { useEffect, useState } from 'react';

// Kept apart so the address never appears as one string in the static HTML.
const USER = 'danielku15';
const DOMAIN = 'coderline.net';

export interface MaintainerEmailProps {
  subject?: string;
}

/** Mail link to the maintainer, assembled in the browser after hydration. */
export const MaintainerEmail: React.FC<MaintainerEmailProps> = ({ subject }) => {
  const [address, setAddress] = useState<string | null>(null);
  useEffect(() => setAddress(`${USER}@${DOMAIN}`), []);

  if (!address) {
    return (
      <span>
        {USER} at {DOMAIN}
      </span>
    );
  }

  const href = subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
  return <a href={href}>{address}</a>;
};
