
/**
 *  FileHandler handles files
 */
export class FileHandler {

    /**
     * 
     * @param suggested the suggested name for the user to pick
     * @returns FileHandle for a file.
     */
    async getGpkgFileHandle(suggested: string): Promise<FileSystemFileHandle> {
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: suggested,
        });
        return fileHandle;
    }
    
}

