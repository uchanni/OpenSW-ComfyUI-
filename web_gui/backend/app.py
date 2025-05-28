"""
backend/app.py
────────────────────────────────────────────────────────
Flask 서버: React → /generate POST 요청을 받아
  ① CheckpointLoaderSimple 노드
  ② EmptyLatentImage
  ③ CLIPTextEncode (positive)
  ④ CLIPTextEncode (negative, 비어 있으면 빈 문자열로)
  ⑤ KSampler
  ⑥ VAEDecode
  ⑦ SaveImage
로 이루어진 워크플로우 JSON을 만들고
ComfyUI(127.0.0.1:8188) 에 실행을 요청한 뒤
base64 이미지를 React 쪽으로 그대로 반환한다.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

# ── ComfyUI에서 실제로 로드 가능한 이름/파일명을 넣어 주세요 ──────────────────
CHECKPOINT_FILE = "v1-5-pruned-emaonly-fp16.safetensors"  # 체크포인트 파일명
SAMPLER_NAME    = "euler"                                 # KSampler 드롭다운에 보이는 문자열
SCHEDULER_NAME  = "normal"                                # "normal", "karras", …
# ────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)          # React(dev 서버 5173) → Flask(5000) CORS 허용

# --------------------------------------------------------------------------
# POST /generate
# body 예시: {"prompt":"창밖 고양이","neg":"","seed":123}
# --------------------------------------------------------------------------
@app.post("/generate")
def generate():
    body  = request.json
    pos   = body["prompt"].strip()
    neg   = body.get("neg", "").strip()        # 비어 있으면 빈 문자열
    seed  = int(body.get("seed", 42))

    width, height = 512, 512                   # 필요하면 클라이언트에서 받아도 됨
    steps         = 20
    cfg_scale     = 7.0
    denoise       = 1.0

    prompt = {}

    # ── 0. CheckpointLoaderSimple ──────────────────────────────────────────
    # MODEL / CLIP / VAE 세 가지 객체를 한 노드가 모두 출력한다.
    prompt["0"] = {
        "class_type": "CheckpointLoaderSimple",
        "inputs": { "ckpt_name": CHECKPOINT_FILE }
    }

    # ── 1. 빈 latent 이미지 ───────────────────────────────────────────────
    prompt["1"] = {
        "class_type": "EmptyLatentImage",
        "inputs": { "width": width, "height": height, "batch_size": 1 }
    }

    # ── 2. 긍정 프롬프트 인코딩 ───────────────────────────────────────────
    prompt["2"] = {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": pos, "clip": ["0", 1] }      # ["checkpoint 노드", CLIP 슬롯]
    }

    # ── 3. 부정 프롬프트 인코딩 ───────────────────────────────────────────
    prompt["3"] = {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": neg, "clip": ["0", 1] }
    }

    # ── 4. KSampler ───────────────────────────────────────────────────────
    prompt["4"] = {
        "class_type": "KSampler",
        "inputs": {
            "steps":   steps,
            "seed":    seed,
            "cfg":     cfg_scale,
            "denoise": denoise,
            "sampler_name": SAMPLER_NAME,
            "scheduler":    SCHEDULER_NAME,

            "model":        ["0", 0],       # ["checkpoint", MODEL]
            "sampler":      SAMPLER_NAME,   # 호환성 위해 sampler 필드에도 동일 문자열
            "latent_image": ["1", 0],
            "positive":     ["2", 0],
            "negative":     ["3", 0],
        }
    }

    # ── 5. VAE Decode ─────────────────────────────────────────────────────
    prompt["5"] = {
        "class_type": "VAEDecode",
        "inputs": { "samples": ["4", 0], "vae": ["0", 2] }  # ["checkpoint", VAE]
    }

    # ── 6. SaveImage (항상 출력 필요) ──────────────────────────────────────
    prompt["6"] = {
        "class_type": "SaveImage",
        "inputs": { "images": ["5", 0], "filename_prefix": "ComfyUI" }
    }

    workflow = { "prompt": prompt }

    # ----------------------------------------------------------------------
    # ComfyUI 서버 호출
    # ----------------------------------------------------------------------
    try:
        r = requests.post("http://127.0.0.1:8188/prompt",
                          json=workflow, timeout=600)
        r.raise_for_status()
    except requests.RequestException as err:
        return jsonify({"error": str(err)}), 500

    return jsonify(r.json())           # React가 images[0].image(base64) 사용

# --------------------------------------------------------------------------
if __name__ == "__main__":
    # 터미널:  (venv) $ python app.py
    app.run(port=5000, debug=True)
