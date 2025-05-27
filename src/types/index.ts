
export type Snapshot = {
  imageUrl: string;
  caption: string;
  dataAiHint?: string;
};

export type NotificationItem = {
  id: string;
  type: 'doorbell' | 'snapshot' | 'cooking_list';
  timestamp: string; // ISO string for Firebase compatibility
  payload: string | Snapshot | string[]; // string for doorbell message, Snapshot for snapshot, string[] for cooking list
  read?: boolean;
};
