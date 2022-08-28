import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { WinstonLogLevels } from './enums/WinstonLogLevel';
import { ILog } from './interfaces/ILog';

/**
 * Basic route logging service with specific formatted message, using Winston logging library dependency.
 *
 * By default, HTTP status code is set to 500 and logging level to `error`.
 *
 * A custom message is required to be specified. Make sure it's something meaningful and relevant to the location where the error was thrown.
 */
@Injectable({ scope: Scope.REQUEST })
export class RouteLoggingService implements ILog {
  private loggingLevel: WinstonLogLevels = WinstonLogLevels.error;
  private httpStatusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  private customMessage: string;
  private payload: unknown;
  private errorStack: string;
  private errorMessage: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  public log(): Logger {
    return this.logger.log(this.loggingLevel, this.getFormattedMessage());
  }

  public setLoggingLevel(loggingLevel: WinstonLogLevels) {
    this.loggingLevel = loggingLevel;
    return this;
  }

  public setHttpStatusCode(httpStatusCode: HttpStatus) {
    this.httpStatusCode = httpStatusCode;
    return this;
  }

  public setCustomMessage(message: string) {
    this.customMessage = message;
    return this;
  }

  public setPayload(payload: unknown) {
    this.payload = JSON.stringify(payload);
    return this;
  }

  public setErrorStack(error: string) {
    this.errorStack = error;
    return this;
  }

  public setErrorMessage(error: string) {
    this.errorMessage = error;
    return this;
  }

  private getFormattedMessage(): string {
    if (!this.customMessage) {
      throw new Error('Custom message is required.');
    }
    this.customMessage = `
    [ Log level: ${this.loggingLevel} | HTTP Status Code: ${this.httpStatusCode} ] ${this.customMessage}
    `;
    if (this.errorStack || this.errorMessage || this.payload) {
      this.customMessage += 'Additional information:\n';
    }
    if (this.payload) this.customMessage += `[Request body] ${this.payload}\n`;
    if (this.errorStack)
      this.customMessage += `[Error stack] ${this.errorStack}\n`;
    if (this.errorMessage)
      this.customMessage += `[Error message] ${this.errorMessage}`;
    return this.customMessage;
  }
}
