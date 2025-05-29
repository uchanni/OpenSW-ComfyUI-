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

      // ComfyUI 응답: images or output.images
      const imgObj = res.data?.images?.[0] ?? res.data?.output?.images?.[0];

      if (!imgObj?.image) {
        alert("이미지를 찾을 수 없습니다.");
        console.warn("응답에 image 없음:", res.data);
        return;
      }

      setImg("data:image/png;base64," + imgObj.image);
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
          <input
            value={neg}
            onChange={e => setNeg(e.target.value)}
            placeholder="(옵션) 제외할 요소 입력"
          />
          <input
            type="number"
            value={seed}
            onChange={e => setSeed(e.target.value)}
            placeholder="Seed 값 (기본: 42)"
          />
        </div>
      )}

      <button onClick={run} disabled={loading}>
        {loading ? "이미지 생성 중…" : "이미지 생성"}
      </button>

      {img && (
        <img src={img} alt="결과 이미지" style={{ marginTop: "20px", maxWidth: "100%" }} />
      )}
    </div>
  );
}
