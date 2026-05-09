import React from "react";
import styles from "./StatCard.module.css";
import { Card } from "@/components/ui/Card/Card";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.iconWrapper}>
          <Icon className={styles.icon} />
        </div>
      </div>
      {loading ? (
        <Skeleton className={styles.skeleton} />
      ) : (
        <div className={styles.value}>{value}</div>
      )}
    </Card>
  );
}
