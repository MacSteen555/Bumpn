import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Request, Router } from 'express';
import { upload } from './config/storage';

const router: Router = Router();

// Endpoint for uploading media to R2
// Expected field name from React Native is 'media'
router.post('/upload', ClerkExpressRequireAuth({}) as any, upload.single('media') as any, (req: Request, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // @ts-ignore - multer-s3 adds location property
    const fileUrl = (req.file as any).location;

    res.json({
        message: 'Successfully uploaded',
        mediaUrl: fileUrl,
    });
});

export default router;
