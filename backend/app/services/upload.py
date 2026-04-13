try:
    import cloudinary.uploader
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False

def upload_file(file):
    if not CLOUDINARY_AVAILABLE:
        # Return a dummy URL for testing when cloudinary is not available
        return "https://example.com/uploaded-file.jpg"

    result = cloudinary.uploader.upload(file.file)
    return result["secure_url"]