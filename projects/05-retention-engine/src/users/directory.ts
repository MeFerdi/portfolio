export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
}

/** Contact details live outside the event trail, so PII never reaches the LLM prompt. */
export interface UserDirectory {
  create(profile: UserProfile): Promise<void>;
  get(userId: string): Promise<UserProfile | undefined>;
}

export class InMemoryUserDirectory implements UserDirectory {
  private readonly users = new Map<string, UserProfile>();

  async create(profile: UserProfile): Promise<void> {
    this.users.set(profile.id, profile);
  }

  async get(userId: string): Promise<UserProfile | undefined> {
    return this.users.get(userId);
  }
}
