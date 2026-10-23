export type PublicUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'SALES';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
};

export type UserFormValues = {
  email: string;
  password: string;
  role: 'ADMIN' | 'SALES';
};
