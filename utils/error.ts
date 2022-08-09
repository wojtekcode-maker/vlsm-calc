import {NextFunction, Request, Response} from "express";

export class ValidationError extends Error {
};

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const message = err instanceof ValidationError ? err.message : 'Sorry, please try again later.'
    res
        .status(err instanceof ValidationError ? 400 : 500)
        .json({
            message,
        });
}