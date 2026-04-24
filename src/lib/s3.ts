import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? 'ru-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
});

export const BUCKET = process.env.S3_BUCKET!;

// Стратегии хранения — определяют префикс для каждого типа контента
export const S3Prefix = {
    concertPhotos: 'concert-photos/',
    wikiCovers: 'wiki-covers/',
    instructorPhotos: 'instructor-photos/',
    newsCovers: 'news-covers/',
} as const;

export type S3PrefixKey = keyof typeof S3Prefix;

export async function uploadImage(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    prefix: string
): Promise<string> {
    const key = `${prefix}${fileName}`;
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
    }));
    return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
}

export async function deleteImage(fileName: string, prefix: string): Promise<void> {
    const key = `${prefix}${fileName}`;
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function listImages(prefix: string): Promise<string[]> {
    const result = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }));
    return (result.Contents ?? [])
        .filter((obj) => obj.Key && obj.Key !== prefix)
        .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0))
        .map((obj) => `${process.env.S3_ENDPOINT}/${BUCKET}/${obj.Key}`);
}
