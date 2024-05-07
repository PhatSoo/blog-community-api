export type ResponseType = {
    message: string;
    statusCode: number;
    data?: any;
};

export type Token = {
    id: string;
    displayName: string;
    isAdmin: boolean;
};

export interface UserRequest extends Request {
    user: Token;
}
