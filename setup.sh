#!/bin/bash
# 테크 용어집 설치 스크립트

echo "테크 용어집 설치를 시작합니다..."

# 의존성 설치
echo "필요한 npm 패키지를 설치합니다..."
npm install

# 디렉토리 생성 확인
echo "필요한 디렉토리 구조를 확인합니다..."

if [ ! -d "detail" ]; then
  echo "detail 디렉토리를 생성합니다..."
  mkdir -p detail
fi

if [ ! -d "data" ]; then
  echo "data 디렉토리를 생성합니다..."
  mkdir -p data
  
  # terms.json 파일이 없으면 기본 파일 생성
  if [ ! -f "data/terms.json" ]; then
    echo "기본 terms.json 파일을 생성합니다..."
    echo '{
  "terms": []
}' > data/terms.json
  fi
fi

# 실행 권한 설정
chmod +x setup.sh

echo "설치가 완료되었습니다!"
echo "서버를 시작하려면 다음 명령어를 실행하세요: npm start"