import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [neg, setNeg] = useState("");
  const [seed, setSeed] = useState(42);
  const [show, setShow] = useState(false);
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7.0);


  const run = async () => {
    if (!prompt.trim()) {
      alert("프롬프트를 입력하세요.");
      return;
    }

    setLoading(true);

    try {
      console.log("요청 보냄: ", { prompt, neg, seed });

      const res = await axios.post("http://127.0.0.1:5000/generate", {
        prompt,
        ...(neg.trim() && { neg }),
        ...(show && {
          seed: Number(seed),
          width: Number(width),
          height: Number(height),
          steps: Number(steps),
          cfg: Number(cfg),
        })
      });


      console.log("응답 수신:", res.data);

      const imgObj = res.data?.images?.[0];
      if (!imgObj?.filename) {
        alert("이미지를 찾을 수 없습니다.");
        console.warn("응답에 filename 없음:", res.data);
        return;
      }

      const url = `http://127.0.0.1:8188/view?filename=${imgObj.filename}&subfolder=${imgObj.subfolder}&type=${imgObj.type}`;
      setImg(url);
    } catch (err) {
      console.error("에러 발생:", err);
      alert("이미지 생성 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <h2>ComfyUI Mega-Node GUI</h2>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="한국어 프롬프트 입력"
      />

      <button onClick={() => setShow(!show)}>
        {show ? "고급 옵션 ▲" : "고급 옵션 ▼"}
      </button>

      {show && (
        <div className="adv">
          <div className="input-group">
            <label>
              Negative Prompt
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (생성에서 제외하고 싶은 요소)
              </span>
            </label>
            <input
              value={neg}
              onChange={e => setNeg(e.target.value)}
              placeholder="예: 흐림, 저화질"
            />
          </div>

          <div className="input-group">
            <label>
              Seed
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (예: 42, 12345 — 같을수록 같은 이미지)
              </span>
            </label>
            <input
              type="number"
              value={seed}
              onChange={e => setSeed(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              Width
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (이미지 가로 해상도, 기본: 512)
              </span>
            </label>
            <input
              type="number"
              value={width}
              onChange={e => setWidth(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              Height
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (이미지 세로 해상도, 기본: 512)
              </span>
            </label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              Steps
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (디퓨전 반복 횟수, 높을수록 정밀 — 예: 20)
              </span>
            </label>
            <input
              type="number"
              value={steps}
              onChange={e => setSteps(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              CFG Scale
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (프롬프트 반영 강도, 일반적으로 5~15)
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              value={cfg}
              onChange={e => setCfg(e.target.value)}
            />
          </div>
        </div>


      )}

      <button onClick={run} disabled={loading}>
        {loading ? "이미지 생성 중…" : "이미지 생성"}
      </button>

      {img && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={img}
            alt="결과 이미지"
            style={{ maxWidth: "100%", display: "block", marginBottom: "10px" }}
          />
          <a href={img} download="comfyui_image.png">
            <button>이미지 다운로드</button>
          </a>
        </div>
      )}
    </div>
  );
}
