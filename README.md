
# 🚀 OpenSW-ComfyUI 개선  
*오픈소스SW기초 6분반 9조*

---

## 📝 프로젝트 소개

본 프로젝트에서는 **Hugging Face 기반의 SentenceTransformer 및 KeyBERT 모델**을 활용한 자연어 파싱 로직을 **ComfyUI의 노드 시스템 내에 직접 통합**하였습니다.  
사용자는 **한글로 입력한 문장을 DeepL API**를 통해 영어로 번역하고, 이후 문장을 파싱·후처리하여 **CLIPTextEncode 노드로 전달**되도록 처리 흐름을 구성하였습니다.  
또한, **React와 Flask**를 기반으로 한 간결한 웹 기반 GUI를 구현하여, 복잡한 노드 구성을 숨기고 **이미지 크기, 시드값, CFG 등 핵심 설정만으로** 손쉽게 이미지 생성을 실행할 수 있도록 하였습니다.

---

## ⚙️ 기술적 장점
- **DeepL, Hugging Face, Spacy, KeyBERT**를 결합한 파이프라인으로 정교한 프롬프트 파싱이 가능  
- **번역, 키워드 추출, 구문 병합 등 전처리 자동화** → CLIPTextEncode에 최적화된 입력 생성  
- 불필요한 키워드 제거 및 **중요 구문 강조(가중치 부여)** → 이미지 품질 향상

---

## 🧑‍💻 사용자 편의성
- **한글 문장만 입력**하면 모든 처리가 자동으로 이루어져 사용이 매우 간편  
- **React + Flask 기반 GUI**를 통해 이미지 크기, 시드값 등 최소한의 옵션만 입력  
- 복잡한 ComfyUI 노드를 몰라도 **누구나 쉽게 이미지 생성 가능**

---

## 🧱 통합 GUI 아키텍처
> 아키텍처 다이어그램 삽입 예정

---

## 📽️ 구동 영상

[![프로젝트 시연 영상](https://img.youtube.com/vi/jIUUPcVcwEo/0.jpg)](https://www.youtube.com/embed/jIUUPcVcwEo?si=ldfF0CRASY1bH_cQ)

<!-- 또는 HTML iframe 사용 시
<iframe width="560" height="315" src="https://www.youtube.com/embed/jIUUPcVcwEo?si=ldfF0CRASY1bH_cQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
-->

---

## 📅 개발 기간

2025년 5월 ~ 6월 (약 2개월)

---

## 👥 팀원 및 역할

### 🧑‍💼 정유찬 (팀장)  
- ComfyUI 프롬프트에 적합한 다양한 NLP 모델(Hugging Face 기반)의 파싱 성능 실험  
- 비교 기준 수립, 실험 결과 문서화  
- 통합 GUI 설계 및 구현  
- 1차, 2차 발표 및 PPT 제작  
- [GitHub 프로필](https://github.com/uchanni/OpenSW-ComfyUI-)

---

### 👨‍💻 김민준 (팀원)  
- Hugging Face 모델 및 DeepL API를 ComfyUI 노드에 연동하는 초기 구조 구현  
- KeyBERT 및 Spacy 기반 후처리 로직 설계 및 구현  
- 최종 키워드 품질 향상 기여  
- 3차 발표 및 PPT 제작  
- [GitHub 프로필](https://github.com/mjkim1128/OpenSW-ComfyUI-)

---

## 📊 부록

### 🔗 성능개선 테스트 시트 (OneDrive)  
[👉 테스트 시트 바로가기](https://o365sen-my.sharepoint.com/:x:/g/personal/lamborghiner_o365sen_net/EYObqDJVUp9LtYEW4XkPoPABKSqXfGhByycejAsxFGGPVw?e=MYqfCQ)