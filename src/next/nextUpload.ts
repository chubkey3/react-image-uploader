import multer from 'multer';
import multerS3 from 'multer-s3'
import { S3Client } from '@aws-sdk/client-s3';
import cuid2 from '@paralleldrive/cuid2';

export type NextUploadParams = (
    req: any,
    res: any,
    imageDirectory: string,
    BUCKET_NAME: string,
    BUCKET_ENDPOINT: string,
    BUCKET_REGION: string,
    BUCKET_ACCESS_KEY_ID: string,
    BUCKET_ACCESS_SECRET_KEY: string
) => void

const nextUpload: NextUploadParams = (req, res, BUCKET_NAME, BUCKET_ENDPOINT, BUCKET_REGION, BUCKET_ACCESS_KEY_ID, BUCKET_ACCESS_SECRET_KEY, imageDirectory) => {
    
    let filePath = ""
    let filename = ""
        
    const s3 = new S3Client({
        endpoint: BUCKET_ENDPOINT,
        region: BUCKET_REGION,
        credentials: {
            accessKeyId: BUCKET_ACCESS_KEY_ID,
            secretAccessKey: BUCKET_ACCESS_SECRET_KEY
        }
    })

    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: BUCKET_NAME,
            acl: 'public-read',
            key: function(_req, file, cb) {            
                filePath = imageDirectory + cuid2.createId() + '.' + file.originalname.split('.')[1]            
                filename = file.originalname
                cb(null, filePath)
            }
        })
    })

    upload.array('image')(req, res, function(err) {
        if (err){
            console.log(err)
            res.status(400).end()
        } else {
            if (filePath.length > 0){
                res.status(200).json({url: 'https://' + BUCKET_NAME + '.' + BUCKET_ENDPOINT.split('://')[1] + '/' + filePath, filename: filename})
            } else {
                res.status(400).end()
            }
        }
    })
}

export default nextUpload;