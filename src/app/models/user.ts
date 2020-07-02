export interface User {
    id: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    name: string;
    access_token?: string;
}
