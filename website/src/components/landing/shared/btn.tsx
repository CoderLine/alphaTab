import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './btn.module.scss';

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'inverted';
export type BtnSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type BtnAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { to?: undefined; href?: undefined };

type BtnAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { to: string };

type BtnAsExternal = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };

type BtnProps = BtnAsButton | BtnAsLink | BtnAsExternal;

export const Btn: React.FC<BtnProps> = (props) => {
  const { variant = 'primary', size = 'md', icon, iconRight, fullWidth, className, children, ...rest } = props;
  const classes = clsx(styles.btn, styles[variant], styles[size], fullWidth && styles.fullWidth, className);

  const content = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </>
  );

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...anchorRest } = rest as BtnAsLink;
    return (
      <Link to={to} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
};
