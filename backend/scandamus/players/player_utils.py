import io
from django.core.files.base import ContentFile
from PIL import Image

import logging

logger = logging.getLogger(__name__)


def resize_avatar(avatar_file):
    ext = avatar_file.name.split('.')[-1].lower()
    with Image.open(avatar_file) as img:
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) / 2
        top = (height - min_dim) / 2
        right = (width + min_dim) / 2
        bottom = (height + min_dim) / 2
        img = img.crop((left, top, right, bottom))
        img = img.resize((200, 200), Image.Resampling.LANCZOS)

        img_io = io.BytesIO()
        if ext in ['jpg', 'jpeg']:
            img.save(img_io, format='JPEG')
        elif ext == 'png':
            img.save(img_io, format='PNG')
        img_io.seek(0)

        return ContentFile(img_io.read(), avatar_file.name)