import cloudinary.uploader

def upload_file(file):
    result = cloudinary.uploader.upload(file.file)
    return result["secure_url"]