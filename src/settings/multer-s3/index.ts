import { BadRequestException } from '@nestjs/common';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import { join } from 'path';
import { Request } from 'express';
import multer from 'multer';
import { ERROR_MESSAGE } from '@root/utils/error-message';

export class MulterBuilder {
    constructor(
        private readonly s3: aws.S3 = new aws.S3(),
        private readonly imageMimeTypes: string[] = ['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/webp'],
        private readonly mediaMimeTypes: string[] = ['video/mp4'],
        private readonly allowedMimeTypes: string[] = [],
        private resource: string = '',
        private path: string = '',
    ) {
        aws.config.loadFromPath(join(__dirname, '../../../s3.json'));
    }

    allowImageMimeTypes() {
        this.allowedMimeTypes.push(...this.imageMimeTypes);
        return this;
    }

    allowMediaMimeTypes() {
        this.allowedMimeTypes.push(...this.mediaMimeTypes);
        return this;
    }

    setResource(keyword: string) {
        this.resource = keyword;
        return this;
    }

    getResource() {
        return this.resource;
    }

    setPath(path: string) {
        this.path = path;
        return this;
    }

    getPath() {
        return this.path;
    }

    build() {
        return multerS3({
            s3: this.s3,
            bucket: process.env.DIJKSTRA_BUCKNAME,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req: Request, file, callback) => {
                const splitedFileNames = file.originalname.split('.');
                const extension = splitedFileNames.at(splitedFileNames.length - 1);

                const resource = this.getResource();
                const path = this.getPath();
                const filename = `${path ? path : ''}/${new Date().getTime()}.${extension}`;
                return callback(null, encodeURI(`${resource}/${filename}`));
            },
        });
    }
}

const imageMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
const mediaMimeTypes = ['video/mp4'];

export const fileFilter = (kind: 'image' | 'media') => (req: any, file: any, cb: any) => {
    try {
        const types = kind === 'image' ? imageMimeTypes : mediaMimeTypes;
        const mimeType = types.find((im) => im === file.mimetype);
        if (!mimeType) {
            cb(new BadRequestException(), false);
        }

        if (kind === 'media') {
            file.originalname = `${new Date().getTime()}`;
        }

        return cb(null, true);
    } catch (err) {
        throw new BadRequestException(ERROR_MESSAGE.IMAGE_UPLOAD_ERROR);
    }
};

export const profileImageMulterOptions = (): multer.Options => {
    return {
        fileFilter: fileFilter('image'),
        storage: new MulterBuilder().allowImageMimeTypes().setResource('user').setPath('profile-image').build(),
        limits: { fileSize: 1024 * 1024 * 20 },
    };
};
