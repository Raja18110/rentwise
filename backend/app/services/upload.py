try:
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

def upload_file(file, content: bytes):
    """
    Upload file to Cloudinary or return test URL if not available
    
    Args:
        file: UploadFile object with filename
        content: bytes content of the file
    
    Returns:
        str: URL of uploaded file
    
    Raises:
        Exception: If upload fails
    """
    if not CLOUDINARY_AVAILABLE:
        # Return a test URL when cloudinary is not available (for development)
        # In production, this should fail
        import os
        if os.getenv("ENVIRONMENT") == "production":
            raise Exception("Cloudinary not configured for production")
        
        return f"https://example.com/uploads/{file.filename}"

    try:
        # Upload to cloudinary
        result = cloudinary.uploader.upload(
            content,
            resource_type="auto",
            folder="rentwise",
            public_id=file.filename.split('.')[0]
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {str(e)}")
        raise Exception(f"Failed to upload file: {str(e)}")
