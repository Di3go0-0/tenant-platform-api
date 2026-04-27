import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from '../http-exception.filter.js';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logger: { error: jest.Mock };
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string; method: string; correlationId: string };
  let mockHost: any;

  beforeEach(() => {
    logger = { error: jest.fn() };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = { url: '/test', method: 'GET', correlationId: 'corr-123' };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };

    filter = new GlobalExceptionFilter(logger as any);
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        path: '/test',
        correlationId: 'corr-123',
      }),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should handle unknown errors as 500', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
      }),
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('should log 5xx errors', () => {
    const exception = new HttpException('Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);

    filter.catch(exception, mockHost);

    expect(logger.error).toHaveBeenCalled();
  });
});
