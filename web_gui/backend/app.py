"""
backend/app.py
────────────────────────────────────────────────────────
Flask 서버: React → /generate POST 요청을 받아
  -CheckpointLoaderSimple 노드
  -EmptyLatentImage
  -CLIPTextEncode (positive)
  -CLIPTextEncode (negative, 비어 있으면 빈 문자열로)
  -KSampler
  -VAEDecode
  -SaveImage
로 이루어진 워크플로우 JSON을 만들고
ComfyUI(127.0.0.1:8188) 에 실행을 요청한 뒤
base64 이미지를 React 쪽으로 그대로 반환.
"""

# app.py ── ComfyUI 메가노드 GUI 백엔드 (Flask + 요청 결과 polling 포함)

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time

# ComfyUI 리소스
CHECKPOINT_FILE = "v1-5-pruned-emaonly-fp16.safetensors"
SAMPLER_NAME    = "euler"
SCHEDULER_NAME  = "normal"

app = Flask(__name__)
CORS(app)  # React → Flask CORS 허용

@app.post("/generate")
def generate():
    body  = request.json
    pos   = body["prompt"].strip()
    neg   = body.get("neg", "").strip()
    seed  = int(body.get("seed", 42))

    width, height = 512, 512
    steps         = 20
    cfg_scale     = 7.0
    denoise       = 1.0

    prompt = {}

    # 0) Checkpoint Loader
    prompt["0"] = {
        "class_type": "CheckpointLoaderSimple",
        "inputs": { "ckpt_name": CHECKPOINT_FILE }
    }

    # 1) Latent
    prompt["1"] = {
        "class_type": "EmptyLatentImage",
        "inputs": { "width": width, "height": height, "batch_size": 1 }
    }

    # 2) Positive prompt
    prompt["2"] = {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": pos, "clip": ["0", 1] }
    }

    # 3) Negative prompt
    prompt["3"] = {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": neg, "clip": ["0", 1] }
    }

    # 4) KSampler
    prompt["4"] = {
        "class_type": "KSampler",
        "inputs": {
            "steps":   steps,
            "seed":    seed,
            "cfg":     cfg_scale,
            "denoise": denoise,
            "sampler_name": SAMPLER_NAME,
            "scheduler":    SCHEDULER_NAME,
            "model":        ["0", 0],
            "sampler":      SAMPLER_NAME,
            "latent_image": ["1", 0],
            "positive":     ["2", 0],
            "negative":     ["3", 0]
        }
    }

    # 5) VAE Decode
    prompt["5"] = {
        "class_type": "VAEDecode",
        "inputs": { "samples": ["4", 0], "vae": ["0", 2] }
    }

    # 6) SaveImage
    prompt["9"] = {
        "class_type": "SaveImage",
        "inputs": { "images": ["5", 0], "filename_prefix": "ComfyUI" }
    }

    workflow = { "prompt": prompt }

    # 여기에 프롬프트 JSON 출력 추가
    import json
    print("보낼 프롬프트 JSON:")
    print(json.dumps(workflow, indent=2))

    # 1. ComfyUI에게 prompt 요청
    try:
        r = requests.post("http://127.0.0.1:8188/prompt", json=workflow, timeout=600)
        r.raise_for_status()
        res = r.json()
        prompt_id = res.get("prompt_id")
    except Exception as e:
        return jsonify({"error": f"ComfyUI prompt 요청 실패: {e}"}), 500

    if not prompt_id:
        return jsonify({"error": "prompt_id 없음"}), 500

    # 2. /history/{prompt_id} 반복 조회
    for i in range(120):
        try:
            h = requests.get(f"http://127.0.0.1:8188/history/{prompt_id}")
            h.raise_for_status()
            data = h.json()

            print(f"\n[HISTORY 응답 {i+1}/120]")
            print(json.dumps(data, indent=2))  # ← 전체 응답 구조 확인

            if prompt_id in data:
                node_outputs = data[prompt_id].get("outputs", {}).get("9", {})
                images = node_outputs.get("images")

                if images:
                    print(f"이미지 생성 완료 (시도 {i+1}회차)")
                    return jsonify({ "images": images })

            print(f"[{i+1}/120] 아직 이미지 없음…")

        except Exception as e:
            print(f"[{i+1}/120] 예외 발생:", e)

        time.sleep(1)


    return jsonify({"error": "이미지 생성 시간 초과"}), 504


# Run
if __name__ == "__main__":
    app.run(port=5000, debug=True)
