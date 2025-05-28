from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

CLIP   = "CLIPText/ViT-B-32"
MODEL  = "sd1.5.ckpt"
VAE    = "AutoencoderKL"
SAMPLER= "Euler"

app = Flask(__name__)
CORS(app)

@app.post("/generate")
def generate():
    j = request.json
    wf = {
      "prompt": {
        "0":{"class_type":"CLIPTextEncode","inputs":{"text":j["prompt"],"clip":CLIP}},
        "1":{"class_type":"EmptyLatentImage","inputs":{"width":512,"height":512}},
        "2":{"class_type":"KSampler","inputs":{
              "steps":20,"seed":j.get("seed",42),
              "model":MODEL,"sampler":SAMPLER,
              "latent_image":["1",0],"conditioning":["0",0]}},
        "3":{"class_type":"VAEDecode","inputs":{"samples":["2",0],"vae":VAE}}
      }
    }
    if j.get("neg"):
        wf["prompt"]["4"]={"class_type":"CLIPTextEncode",
                           "inputs":{"text":j["neg"],"clip":CLIP}}
        wf["prompt"]["2"]["inputs"]["negative_conditioning"]=["4",0]

    r = requests.post("http://127.0.0.1:8188/prompt",json=wf,timeout=600)
    r.raise_for_status()
    return jsonify(r.json())

if __name__=="__main__":
    app.run(port=5000,debug=True)