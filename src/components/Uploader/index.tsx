import axios from "axios"
import { Dispatch, SetStateAction, useCallback, useState } from "react"

export interface Props {
    message: string;
    relate: string;
    setState: Dispatch<SetStateAction<string | undefined>>,
    endpoint?: string,
    setUploadError?: Dispatch<SetStateAction<boolean>>,
    setCompleted?: Dispatch<SetStateAction<boolean | undefined>>
}

const Uploader = ({message, relate, setState, endpoint, setUploadError, setCompleted}: Props) => {
    //const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [progress, setProgress] = useState<number>(0);
    const handleUpload = useCallback(async (e: any) => {
        let file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            if (setCompleted){
                setCompleted(false)
            }
            //setPreviewImage(URL.createObjectURL(file));

            try {
                let data = new FormData();
                data.append("image", file);

                let upload = await axios.post(endpoint || "/api/uploadimage", data, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress(progressEvent) {
                        if (progressEvent.total){
                            if (progressEvent.loaded/progressEvent.total === 1 && setCompleted){
                                setCompleted(undefined)
                            } else if (setProgress) {
                                setProgress(Math.round(100 * (progressEvent.loaded/progressEvent.total)))
                            }
                        }                        
                    },
                });

                if (upload) {
                    setState(upload.data.url);
                    return;
                }
            } catch (error) {
                if (setUploadError) {
                    setUploadError(true);
                }
            }
        }

        if (setUploadError){
            setUploadError(true)
        }
        
    }, [setState, setUploadError, setCompleted])

    /*
    const removeUpload = useCallback(async (e: any) => {
        
        if (progress === 100){
            try {
                let remove = await axios.post('/api/removeimage', {url: })
            }
        }
        
    }, [])
    */

    return (
        <div>
            <div className="flex h-[55px] w-[330px] lg:h-[50px] bg-white rounded italic pl-4 mt-8 lg:mt-4 items-center border border-black">
                <label htmlFor={relate} className="flex items-center justify-center w-full h-full cursor-pointer ">
                    {fileName ? fileName : message}                
                    <input type="file" id={relate} accept="image/*" onChange={handleUpload} className="hidden"/>
                </label>            
                
                {/*previewImage && (
                    <>                
                    <div style={{backgroundColor: 'rgba(1, 4, 9, 0.8)'}} className="w-[100%] h-[100%] fixed left-0 top-0 z-1000" />
                    <div className="absolute top-[50%] bottom-[50%] w-[300px] bg-[#af3ea2]">
                        
                        <div className="flex flex-col items-center p-8">
                            <img src={previewImage} alt="Preview" className="w-full h-full rounded-2xl" />
                            <button className="text-white italic p-1 text-[18px] mt-[10px]"
                                onClick={() => setPreviewImage(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                    </>

                )*/}
            </div>

            {(progress !== 100 && progress !== 0) && <div>
                <div style={{width: `${3.3 * progress}px`, transition: 'width 0.5s ease-out'}} className={"bg-[#0AA653] h-[10px] mt-[10px]"}></div>
                <div className="w-[330px] text-center">{progress}%</div>
            </div>}
        </div>
    )
}

export default Uploader