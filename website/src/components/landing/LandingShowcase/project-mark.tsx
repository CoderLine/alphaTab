import React from 'react';
import styles from './project-mark.module.scss';

interface ProjectMarkProps {
  size?: number;
  glyph: string;
  accent: string;
  square?: boolean;
}

export const ProjectMark: React.FC<ProjectMarkProps> = ({ size = 40, glyph, accent, square = false }) => (
  <div
    className={`${styles.mark} ${square ? styles.square : ''}`}
    style={
      {
        '--mark-size': `${size}px`,
        '--mark-font': `${size * 0.5}px`,
        '--mark-accent': accent,
      } as React.CSSProperties
    }
  >
    {glyph}
  </div>
);
