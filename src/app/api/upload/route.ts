import { NextRequest, NextResponse } from 'next/server';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const MAX_UPLOAD_SIZE_MB = 20;
const EXPIRES_IN_SECONDS = 5;

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    const s3Client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_REGION!,
      forcePathStyle: true,
    });

    const { presignedUrl, formFields } = await generatePresignedPost(
      s3Client,
      process.env.AWS_BUCKET_NAME!,
      randomUUID(),
      contentType,
    );

    return NextResponse.json({ url: presignedUrl, fields: formFields });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({ error: 'Something went wrong' });
  }
}

async function generatePresignedPost(
  s3Client: S3Client,
  bucket: string,
  key: string,
  contentType: string,
): Promise<{ presignedUrl: string; formFields: Record<string, string> }> {
  const commandOutput = await createPresignedPost(s3Client, {
    Bucket: bucket,
    Key: key,
    Conditions: [
      ['content-length-range', 0, MAX_UPLOAD_SIZE_MB * 1024 * 1024],
      ['starts-with', '$Content-Type', contentType],
    ],
    Fields: {
      acl: 'public-read',
      'Content-Type': contentType,
    },
    Expires: EXPIRES_IN_SECONDS,
  });

  return {
    presignedUrl: commandOutput.url,
    formFields: commandOutput.fields,
  };
}
