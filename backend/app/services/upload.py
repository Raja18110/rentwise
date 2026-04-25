try:
    import os
    import cloudinary
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
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME") or os.getenv("CLOUD_NAME")
        api_key = os.getenv("CLOUDINARY_API_KEY") or os.getenv("API_KEY")
        api_secret = os.getenv("CLOUDINARY_API_SECRET") or os.getenv("API_SECRET")

        if cloud_name and api_key and api_secret:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True,
            )
        elif os.getenv("ENVIRONMENT") == "production":
            raise Exception("Cloudinary environment variables are missing")

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
