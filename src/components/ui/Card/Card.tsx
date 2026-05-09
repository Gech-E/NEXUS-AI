import React from "react";
import styles from "./Card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradientBorder";
  hoverable?: boolean;
}

export function Card({
  className = "",
  variant = "default",
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const variantClass = styles[variant];
  const hoverClass = hoverable ? styles.hoverable : "";
  
  return (
    <div
      className={`${styles.cardBase} ${variantClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
