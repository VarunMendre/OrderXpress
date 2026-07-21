/**
 * Standard success response format
 * @param res - Express response object
 * @param data - Data to send (optional)
 * @param message - Success message (optional)
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccessResponse = (
  res: any,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response format
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param errors - Additional error details (optional)
 */
export const sendErrorResponse = (
  res: any,
  message: string,
  statusCode: number = 500,
  errors: any = null
) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

export default {
  sendSuccessResponse,
  sendErrorResponse
};