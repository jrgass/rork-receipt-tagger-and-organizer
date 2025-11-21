export interface Category {
  id: string;
  name: string;
  glCode: string;
}

export interface Receipt {
  id: string;
  imageUri: string;
  date: string;
  description: string;
  purpose: string;
  category: string;
  glCode: string;
  cost: string;
  timestamp: number;
}

export interface SessionUserInfo {
  firstName: string;
  lastName: string;
  location: 'GR' | 'OK' | 'MA';
  sessionId: string;
}

export interface Session {
  id: string;
  receipts: Receipt[];
  createdAt: number;
  status: 'active' | 'submitted';
  userInfo?: SessionUserInfo;
}