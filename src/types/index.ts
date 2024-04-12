export type ResponseType = {
    message: string;
    statusCode: number;
    data?: any;
};

export type Token = {
    userId: string;
    displayName: string;
    isAdmin: boolean;
};

export interface UserRequest extends Request {
    userInfo: {
        userId: string;
        displayName: string;
        isAdmin: boolean;
    };
}
