import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileEntity, FileDocument } from 'src/schema/file.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {

  constructor(@InjectModel(FileEntity.name) private fileModel: Model<FileDocument>) {}

  async saveFileInfo(file: Express.Multer.File) {
    const fileInfo = {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    };
    const newFile = new this.fileModel(fileInfo);
    return newFile.save();
  }

  async getAllFiles() {
    return this.fileModel.find().exec();
  }
}