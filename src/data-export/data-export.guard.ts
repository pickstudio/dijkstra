import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DataExportJwtGuard extends AuthGuard('jwt-data') {}
