import React from "react";
import styles from "./ActivityItem.module.css";

export interface ActivityItemProps {
  icon: React.ElementType;
  title: string;
  time: string;
  color: string;
}

export function ActivityItem({ icon: Icon, title, time, color }: ActivityItemProps) {
  return (
    <div className={styles.item}>
      <div 
        className={styles.iconWrapper} 
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.time}>{time}</p>
      </div>
    </div>
  );
}
