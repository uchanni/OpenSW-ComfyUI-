import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [neg, setNeg] = useState("");
  const [seed, setSeed] = useState(42);
  const [show, setShow] = useState(false);
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 진행률 상태 추가

  // 로딩 상태 기반으로 진행 바 동작
  useEffect(() => {
    let timer;

    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 150);
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
        ...(show && { seed: Number(seed) })
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
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="한국어 프롬프트 입력"
      />

      <button onClick={() => setShow(!show)}>
        {show ? "고급 옵션 ▲" : "고급 옵션 ▼"}
      </button>

      {show && (
        <div className="adv">
          <input
            value={neg}
            onChange={(e) => setNeg(e.target.value)}
            placeholder="(옵션) 제외할 요소 입력"
          />
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Seed 값 (기본: 42)"
          />
        </div>
      )}

      <button onClick={run} disabled={loading}>
        {loading ? "이미지 생성 중…" : "이미지 생성"}
      </button>

      {/* ✅ 진행 바 추가 */}
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
        <>
          <img
            src={img}
            alt="결과 이미지"
            style={{ marginTop: "20px", maxWidth: "100%" }}
          />
          <div style={{ marginTop: "10px" }}>
            <a href={img} download="comfyui_image.png">
              <button>이미지 다운로드</button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
