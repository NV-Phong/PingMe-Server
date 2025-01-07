import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileEntity, FileSchema } from 'src/schema/file.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
const path = require('path');
@Module({
  imports: [
    // Kết nối MongoDB
    MongooseModule.forFeature([{ name: FileEntity.name, schema: FileSchema }]),
    ServeStaticModule.forRoot({
        rootPath: path.join(__dirname, '..', 'repository'),
        serveRoot: '/repository',
      }),
  ],
  controllers: [FileController],  // Đăng ký FileController
  providers: [FileService],       // Đăng ký FileService
})
export class FileModule {}
