/**
 * 테크 용어집 서버 - 상세 페이지 저장 및 용어 데이터 관리
 */

// 필요한 모듈 불러오기
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// Express 앱 생성
const app = express();

// JSON 파싱 미들웨어 추가 (대용량 콘텐츠 허용)
app.use(bodyParser.json({ limit: '10mb' }));

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname)));

// CORS 설정
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 상세 페이지 저장 API 엔드포인트
app.post('/api/save-detail-page', (req, res) => {
    const { fileName, content } = req.body;
    
    // 파일명 유효성 검사
    if (!fileName || !content) {
        return res.status(400).json({ success: false, error: '파일명과 내용이 필요합니다.' });
    }
    
    // 보안: 파일명에 위험한 문자가 없는지 확인
    if (fileName.includes('..') || fileName.includes('/')) {
        return res.status(400).json({ success: false, error: '파일명에 잘못된 문자가 포함되어 있습니다.' });
    }
    
    // 저장할 디렉토리와 파일 경로
    const detailDir = path.join(__dirname, 'detail');
    const filePath = path.join(detailDir, `${fileName}.html`);
    
    // detail 디렉토리가 없으면 생성
    if (!fs.existsSync(detailDir)) {
        fs.mkdirSync(detailDir, { recursive: true });
    }
    
    // 파일 저장
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`파일 저장 성공: ${filePath}`);
        
        // 성공 응답
        return res.json({
            success: true,
            filePath: `/detail/${fileName}.html`
        });
    } catch (error) {
        console.error('파일 저장 오류:', error);
        return res.status(500).json({
            success: false,
            error: '파일 저장 중 오류가 발생했습니다.'
        });
    }
});

// 용어 데이터 저장 API 엔드포인트
app.post('/api/save-terms', (req, res) => {
    const { terms } = req.body;
    
    // 데이터 유효성 검사
    if (!terms || !Array.isArray(terms)) {
        return res.status(400).json({ success: false, error: '유효한 용어 데이터가 필요합니다.' });
    }
    
    // 저장할 파일 경로
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'terms.json');
    
    // data 디렉토리가 없으면 생성
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // JSON 파일로 저장
    try {
        const data = { terms };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`용어 데이터 저장 성공: ${filePath}`);
        
        // 성공 응답
        return res.json({
            success: true,
            count: terms.length
        });
    } catch (error) {
        console.error('데이터 저장 오류:', error);
        return res.status(500).json({
            success: false,
            error: '데이터 저장 중 오류가 발생했습니다.'
        });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT} 에서 테크 용어집에 접속할 수 있습니다.`);
});