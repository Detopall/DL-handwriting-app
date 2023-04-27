import tensorflow as tf
from PIL import Image
import numpy as np
from fastapi import FastAPI
import io
import base64
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


model = tf.keras.models.load_model('./handwritten-mnist.model')

@app.get("/")
def index():
    return {'message': 'Hello, world!'}


def preprocess(image_bytes):
    # Decode base64-encoded image and convert to PIL Image object
    img = Image.open(io.BytesIO(image_bytes))
    # Convert transparent background to white
    if img.mode == 'RGBA':
        img.load()
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    # Convert to grayscale
    img = img.convert('L')
    # Invert colors to black background with white numbers
    img = np.invert(np.array(img))
    # Resize image to 28x28 pixels
    img = Image.fromarray(img).resize((28, 28))
    # Convert image to numpy array and normalize pixel values
    X = np.array(img).reshape(1, 28, 28, 1) / 255
    return X



@app.post("/predict")
def predict(image: dict):
    # Decode base64-encoded image
    image_bytes = base64.b64decode(image["image"].split(",")[1])

    # Convert image to preprocessed numpy array and save image to server
    X = preprocess(image_bytes)
    image = Image.fromarray(X[0].reshape(28, 28) * 255).convert("RGB")
    image.save("image.png")

    # Make prediction using the model
    prediction = model.predict(X)
    # Convert prediction to integer
    prediction = int(np.argmax(prediction))
    
    print(prediction)

    return {'prediction': prediction}


if __name__ == '__main__':
    uvicorn.run('main:app', host='localhost', port=8000, reload=True)
