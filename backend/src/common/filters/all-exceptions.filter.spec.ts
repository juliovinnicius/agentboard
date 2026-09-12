import { BadRequestException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

function createHost(): {
  host: ArgumentsHost;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/api/v1/thing', method: 'GET' }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    // The filter logs 5xx stacks; keep them out of the test output.
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the status and message of an HttpException', () => {
    const { host, status, json } = createHost();

    new AllExceptionsFilter().catch(
      new BadRequestException(['name must be a string']),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['name must be a string'],
        path: '/api/v1/thing',
      }),
    );
  });

  it('hides details of unexpected errors behind a 500', () => {
    const { host, status, json } = createHost();

    new AllExceptionsFilter().catch(
      new Error('connection string leaked'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });
});
