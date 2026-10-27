from PIL import Image

SRC = '/root/.hermes/cache/images/img_100cd54ac0c0.png'
LIGHT_BLUE = (154, 140, 255, 255)

src = Image.open(SRC).convert('RGBA')
bbox = src.getchannel('A').getbbox()
logo = src.crop(bbox)

# Versi mode gelap: warna diterangkan, alpha dipertahankan.
dark = Image.new('RGBA', logo.size, LIGHT_BLUE)
dark.putalpha(logo.getchannel('A'))

pad = 8


def save(im, path, width=800):
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    canvas = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    canvas.save(path)
    print(path, canvas.size)


save(logo, 'public/logo.png')
save(dark, 'public/logo-dark.png')

# Favicon dari ikon P
icon_right = bbox[0] + round((bbox[2] - bbox[0]) * 0.285)
icon = src.crop((bbox[0], bbox[1], icon_right, bbox[3]))
side = max(icon.size)
square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
square.paste(icon, ((side - icon.width) // 2, (side - icon.height) // 2))
square = square.resize((512, 512), Image.LANCZOS)
square.save('app/icon.png')
square.save('public/favicon.png')
print('favicon 512x512')
