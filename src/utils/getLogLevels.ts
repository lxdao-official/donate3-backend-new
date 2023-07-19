import { LogLevel } from '@nestjs/common';
export default function getLogLevels(isProd: boolean): LogLevel[] {
  return isProd
    ? ['log', 'warn', 'error']
    : ['log', 'error', 'warn', 'debug', 'verbose'];
}
