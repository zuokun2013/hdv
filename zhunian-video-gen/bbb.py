
from PIL import Image, ImageDraw, ImageFont

# Load the image
image = Image.open("Slide26.png")

# Create a drawing context
draw = ImageDraw.Draw(image)
text = '亡者：黄淑群女士'
position = (20, 20)

font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 64)
# font = ImageFont.truetype('Arial.ttf',24)

# Add text to the image
draw.text(position, text, font=font, fill=(10, 10, 10))

# Save or display the modified image
image.save("output.png")