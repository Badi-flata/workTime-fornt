export interface LoginInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName?: string;
  name?: string;
  phone?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
}

export interface ProfileUpdateInput {
  fullName?: string;
  email?: string;
  phone?: string;
  imageProfile?: string;
  jobTitle?: string;
}

export interface UpdateAvatarInput {
  imageProfile: string;
}
