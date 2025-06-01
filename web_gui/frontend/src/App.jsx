import { useState, useEffect } from "react"; // ✅ useEffect 추가
import axios from "axios";
import "./App.css";

export default function App() {
  const [progress, setProgress] = useState(0); // ✅ 진행률 상태 추가
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

  // ✅ 진행률 useEffect 추가
  useEffect(() => {
    let timer;

    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 1 : prev));
      }, 375); // 30초에 80% 도달
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }

    return () => clearInterval(timer);
  }, [loading]);

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
          {/* 기존 고급 옵션 입력들 (생략 안 함) */}
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
              placeholder="예: 텍스트, 저화질, 워터마크"
            />
          </div>

          <div className="input-group">
            <label>
              Seed
              <span style={{ fontSize: "12px", color: "#aaa" }}>
                (무작위성을 결정 — 같은 Seed면 같은 결과. 예: 42, 123456)
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

      {/* ✅ 진행 바 UI 추가 */}
      {loading && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#333",
            borderRadius: "8px",
            height: "10px",
            overflow: "hidden",
            margin: "16px 0"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#4caf50",
              transition: "width 0.2s ease"
            }}
          />
        </div>
      )}

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
