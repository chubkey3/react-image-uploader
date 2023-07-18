import axios from "axios"
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"

interface Props {
    message: string;
    relate: string;
    setState: Dispatch<SetStateAction<string | undefined>>,
    setUploadError?: Dispatch<SetStateAction<boolean>>,
    setCompleted?: Dispatch<SetStateAction<boolean | undefined>>
}

const MultiUploader = ({message, relate, setState, setUploadError, setCompleted}: Props) => {
    const [files, setFiles] = useState<File[]>([]);
    const [completedUploads, updateCompletedUploads] = useState<number>(0)
    const [dragActive, setDragActive] = useState<boolean>(false)
    const [fileIndex, setFileIndex] = useState<number>(0)


    const makeUploadRequest = useCallback(async (a: FormData) => await axios.post("/api/uploadimage", a, { headers: {"Content-Type": "multipart/form-data"}, onUploadProgress(progressEvent) {
        
        if (progressEvent.total){                 
           if (progressEvent.loaded/progressEvent.total === 1){
            updateCompletedUploads(prevState => prevState + 1)            
           }           
        }                       
    }}), [])

    const handleUpload = useCallback(async () => {        
        if (files) {                       
            try {                             
                let data = []
                
                for (let i = fileIndex; i < files.length; i++){
                                    
                    let form_data = new FormData();

                    form_data.append("image", files[i]);

                    data.push(form_data)

                    setFileIndex(prevState => prevState + 1)
                }

                axios.all(data.map((a) => makeUploadRequest(a)))
                               
            } catch (error) {
                if (setUploadError) {
                    setUploadError(true);
                }
            }
        }

        if (setUploadError){
            setUploadError(true)
        }
        
    }, [setState, setUploadError, files, fileIndex, makeUploadRequest])

   
    useEffect(() => {
        if (files.length > 0){            
            handleUpload()            
        }        
    }, [handleUpload, files])

    useEffect(() => {
        if (setCompleted){

            if (completedUploads === files.length && completedUploads > 0) {
                setCompleted(true)
            } else {
                setCompleted(false)
            }
        }
        
    }, [setCompleted, completedUploads, files])

    const handleDrag = useCallback((e: any) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: any) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFiles(Array.from(files).concat(Array.from(e.dataTransfer.files || [])))
        }
    }, [files])

    return (
        <div>                
            <div onDrop={handleDrop} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} style={{backgroundColor: dragActive ? 'gray' : 'white'}} className="flex h-[200px] w-[500px] lg:h-[200px] rounded italic pl-4 mt-8 lg:mt-4 items-center border border-black">
                <label htmlFor={relate} className="flex flex-col items-center justify-center w-full h-full cursor-pointer pt-10 overflow-auto">
                    {(files.length > 0) ? Array.from(files).map((file) => (
                    <div key={file.name}>         
                        <div className="">{file.name}</div>
                    </div>)
                    ) : message}                              
                    <input type="file" id={relate} accept="image/*" multiple={true} onChange={(e) => setFiles(Array.from(files).concat(Array.from(e.target.files || [])))} className="hidden"/>
                </label>                                    
            </div>     
            
            {(files.length > 0) && <div style={{width: `${500 * (completedUploads / files.length)}px`, transition: 'width 0.5s ease-out'}} className={"bg-[#0AA653] h-[10px] mt-[10px]"}></div>}
            {(files.length > 0) && <div>{completedUploads}/{files.length}</div>}

        </div>
    )
}

export default MultiUploader