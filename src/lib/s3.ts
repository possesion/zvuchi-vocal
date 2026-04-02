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
export const CONCERT_PREFIX = 'concert-photos/';

export async function uploadConcertPhoto(
    buffer: Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    const key = `${CONCERT_PREFIX}${fileName}`;

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
    }));

    return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
}

export async function deleteConcertPhoto(fileName: string): Promise<void> {
    const key = `${CONCERT_PREFIX}${fileName}`;
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function listConcertPhotos(): Promise<string[]> {
    const result = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: CONCERT_PREFIX,
    }));

    return (result.Contents ?? [])
        .filter((obj) => obj.Key && obj.Key !== CONCERT_PREFIX)
        .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0))
        .map((obj) => `${process.env.S3_ENDPOINT}/${BUCKET}/${obj.Key}`);
}
