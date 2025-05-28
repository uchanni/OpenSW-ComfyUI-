import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [prompt,setPrompt]=useState("");
  const [neg,setNeg]=useState("");
  const [seed,setSeed]=useState(42);
  const [show,setShow]=useState(false);
  const [img,setImg]=useState(null);
  const [loading,setLoading]=useState(false);

  const run=async()=>{
    if(!prompt.trim())return;
    setLoading(true);
    const body={prompt};
    if(neg.trim()) body.neg=neg;
    if(show) body.seed=Number(seed);
    try{
      const r = await axios.post("http://127.0.0.1:5000/generate", body);
      const base64 = r.data?.images?.[0]?.image          // 패턴 A
                  || r.data?.output?.images?.[0]?.image; // 패턴 B

      if (!base64) {
        alert("ComfyUI 응답에 이미지가 없습니다");
        return;
      }
      setImg("data:image/png;base64," + base64);
          }catch(e){alert(e);}
          setLoading(false);
        };

  return(
  <div className="wrap">
    <h2>Comfy Mega-Node GUI</h2>
    <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
              placeholder="한국어 프롬프트"/>
    <button onClick={()=>setShow(!show)}>
      {show?"고급 옵션 ▲":"고급 옵션 ▼"}
    </button>
    {show&&(
      <div className="adv">
        <input value={neg} onChange={e=>setNeg(e.target.value)}
               placeholder="(옵션) 제외 프롬프트"/>
        <input type="number" value={seed}
               onChange={e=>setSeed(e.target.value)}/>
      </div>
    )}
    <button onClick={run} disabled={loading}>
      {loading? "생성 중…" : "이미지 생성"}
    </button>
    {img&&<img src={img} alt="result"/>}
  </div>);
}
