export type Role =
  | "superadmin"
  | "admin_poverty"
  | "admin_lands_roads"
  | "admin_gas_stations";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}
