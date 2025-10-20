export type Profile = {
  userId: string;
  name?: string;
  age?: number;
  sex?: 'M' | 'F' | 'O';
};

export interface ProfileRepository {
  get(userId: string): Promise<Profile | null>;
  update(
    userId: string,
    patch: Partial<Omit<Profile, 'userId'>>
  ): Promise<Profile>;
}
