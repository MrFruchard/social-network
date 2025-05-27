export interface FollowUser {
  user_id: string;
  first_name: string;
  last_name: string;
  image: string;
  username: string;
  about: string;
  followed: boolean;
}

export interface UserProfile {
  id: string;
  last_name: string;
  first_name: string;
  about: string;
  username: string;
  image_url: string;
  public: boolean;
  followers: number;
  following: number;
  created_at: string;
  is_following: number; // 0: Not Following, 1: Following, 2: Waiting, 3: Received Follow Request
  email?: string;
  date_of_birth?: string;
}

export interface FollowedUser {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  image: string;
  about: string;
  followed: boolean;
}

export enum FollowStatus {
  NOT_FOLLOWING = 0,
  FOLLOWING = 1,
  WAITING = 2,
  RECEIVED_REQUEST = 3
}