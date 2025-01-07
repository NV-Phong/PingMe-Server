import {
    Controller,
    Get,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname, join } from 'path';
  import { FileService } from './file.service';
  
  @Controller("file")
  export class FileController {
    constructor(private readonly fileService: FileService) {}
  
    @Post('upload-images')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: diskStorage({
          destination: './src/file/repository',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
      // Lưu thông tin file vào MongoDB
      return this.fileService.saveFileInfo(file);
    }
  
    @Get('all-images')
    async getAllImages() {
      // Lấy danh sách tất cả file từ MongoDB
      const files = await this.fileService.getAllFiles();
  
      if (!files || files.length === 0) {
        throw new Error('No files found');
      }
  
      // Trả về danh sách các file với đường dẫn hình ảnh
      return files.map(file => ({
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: `http://localhost:3000/repository/${file.filename}`, // Thêm URL gốc để tải ảnh
      }));
    }
  }