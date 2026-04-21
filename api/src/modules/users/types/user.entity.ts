export type UserEntity = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
