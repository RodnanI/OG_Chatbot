export interface User {
    id: string;
    username: string;
    name: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}