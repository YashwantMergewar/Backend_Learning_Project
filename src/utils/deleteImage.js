import fs from 'fs';
const deleteImage = (filePath) => {
    try {
        // Check if the file exists
        if(!fs.existsSync(filePath)){
            throw new Error(`File not found: ${filePath}`);
        }
    
        // Delete the file
        fs.unlinkSync(filePath);
        console.log(`File deleted successfully: ${filePath}`);
        
    } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
        throw error; // Re-throw the error for further handling if needed
    }
}

export { deleteImage };