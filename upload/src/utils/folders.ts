import fs from "node:fs/promises";
import path from "node:path";

// Create the temp directory first
export async function createTempBuildDir() {
    try {
        // Ensure the temp directory exists
        const tempBasePath = path.join(process.cwd(), "temp");
        await fs.mkdir(tempBasePath, { recursive: true });

        // Now create the temp build directory
        const tempDir = await fs.mkdtemp(path.join(tempBasePath, "build-"));

        return { tempDir };
    } catch (error) {
        console.error('Error creating temp directory:', error);
        throw error;
    }
}
