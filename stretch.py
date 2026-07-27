from PIL import Image
import os
import glob

def extend_image(filepath, out_path):
    img = Image.open(filepath).convert('RGB')
    w, h = img.size
    
    # Target size 2048x1024 (2:1 ratio)
    new_w = 2048
    pad_w = (new_w - w) // 2
    
    # Create new image
    new_img = Image.new('RGB', (new_w, h))
    
    # Paste original in center
    new_img.paste(img, (pad_w, 0))
    
    # Stretch left edge
    left_edge = img.crop((0, 0, 1, h))
    left_pad = left_edge.resize((pad_w, h))
    new_img.paste(left_pad, (0, 0))
    
    # Stretch right edge
    right_edge = img.crop((w-1, 0, w, h))
    right_pad = right_edge.resize((pad_w, h))
    new_img.paste(right_pad, (pad_w + w, 0))
    
    new_img.save(out_path)
    print(f"Extended {filepath} to {out_path}")

input_dir = r"apps\web\public\courses"
files = glob.glob(os.path.join(input_dir, "course_*.png"))

for f in files:
    if "wide" not in f:
        extend_image(f, f)
