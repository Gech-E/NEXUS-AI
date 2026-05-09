import React from "react";
import styles from "./Button.module.css";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  asChild?: boolean;
  href?: string;
}

export function Button({
  className = "",
  variant = "primary",
  asChild = false,
  href,
  children,
  ...props
}: ButtonProps) {
  const btnClass = `${styles.btnBase} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={btnClass}>
        {children}
      </Link>
    );
  }

  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}
