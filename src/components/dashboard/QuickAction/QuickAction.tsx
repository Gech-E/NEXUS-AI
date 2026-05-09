import React from "react";
import Link from "next/link";
import styles from "./QuickAction.module.css";
import { Card } from "@/components/ui/Card/Card";

export interface QuickActionProps {
  href: string;
  icon: React.ElementType;
  label: string;
  gradient: string;
}

export function QuickAction({ href, icon: Icon, label, gradient }: QuickActionProps) {
  // Extract utility classes from tailwind strings like "from-indigo-500 to-purple-500" if we want, 
  // but since we are relying on CSS modules, let's map these to standard gradient classes or allow tailwind here.
  // We'll keep tailwind utility for the gradient inside the module or pass it through.
  return (
    <Link href={href} className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={`${styles.iconWrapper} bg-gradient-to-br ${gradient}`}>
          <Icon className={styles.icon} />
        </div>
        <div>
          <div className={styles.label}>{label}</div>
          <div className={styles.subtitle}>Click to start</div>
        </div>
      </Card>
    </Link>
  );
}
