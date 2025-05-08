/**
 * OpenAI API 연동을 위한 헬퍼 함수들
 */

// OpenAI API 호출 함수
async function callOpenAI(prompt, apiKey) {
    try {
        // API 키가 없으면 에러
        if (!apiKey) {
            throw new Error('OpenAI API 키가 필요합니다.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: '당신은 전문적인 기술 용어에 대한 자세한 설명과 관련 정보를 제공하는 도우미입니다.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 오류: ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API 호출 오류:', error);
        throw error;
    }
}

// 용어에 대한 상세 정보 생성 함수
async function generateTermDetails(term, category, description, apiKey) {
    const prompt = `
다음 기술 용어에 대한 상세 정보를 JSON 형식으로 생성해주세요:

용어: ${term}
카테고리: ${category}
간단한 설명: ${description}

다음 정보를 포함하는 JSON 객체를 생성해주세요:
1. detailedDescription: 용어에 대한 상세 설명 (3-4 문단)
2. keyFeatures: 주요 특징 (배열 형태로 5-7개 항목)
3. useCases: 활용 사례 (2-3 문단)
4. relatedTerms: 관련 용어 배열 (5-8개 항목)
5. history: 해당 기술/용어의 역사나 배경 (1-2 문단)
6. references: 참고 자료 URL과 제목 (객체 배열로 3-5개 항목)

반드시 JSON 형식으로만 응답해주세요. 추가 설명이나 마크다운은 포함하지 마세요.
`;

    try {
        const jsonString = await callOpenAI(prompt, apiKey);
        // JSON 문자열에서 최초의 { 와 최후의 } 사이 내용만 추출
        const cleanedJson = jsonString.substring(
            jsonString.indexOf('{'),
            jsonString.lastIndexOf('}') + 1
        );
        
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error('용어 상세 정보 생성 오류:', error);
        throw error;
    }
}

// HTML 상세 페이지 생성 함수
function generateDetailPageHTML(term, category, termData) {
    // 기본 정보가 없는 경우 대체 값 사용
    const details = termData || {
        detailedDescription: '',
        keyFeatures: [],
        useCases: '',
        relatedTerms: [],
        history: '',
        references: []
    };

    // 주요 특징 HTML 생성
    let featuresHTML = '';
    if (details.keyFeatures && details.keyFeatures.length > 0) {
        featuresHTML = '<ul>\n' + 
            details.keyFeatures.map(feature => `<li>${feature}</li>`).join('\n') + 
            '\n</ul>';
    }

    // 참고 자료 HTML 생성
    let referencesHTML = '';
    if (details.references && details.references.length > 0) {
        referencesHTML = '<ul>\n' + 
            details.references.map(ref => {
                const title = ref.title || '참고 자료';
                const url = ref.url || '#';
                return `<li><a href="${url}" target="_blank">${title}</a></li>`;
            }).join('\n') + 
            '\n</ul>';
    }

    // 관련 용어 HTML 생성 (관련 용어 카드)
    let relatedTermsHTML = '';
    if (details.relatedTerms && details.relatedTerms.length > 0) {
        relatedTermsHTML = details.relatedTerms.map(relTerm => `
            <div class="related-term-card">
                <span class="category">${category}</span>
                <h3>${relTerm}</h3>
                <a href="#" class="details-link">자세히 보기</a>
            </div>
        `).join('\n');
    }

    // 전체 HTML 템플릿
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${term} - 테크 용어집</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background-color: #f4f7f6;
            color: #333;
        }
        .container {
            width: 90%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        header h1 {
            margin: 0;
            font-size: 24px;
            color: #2c3e50;
        }
        .header-right {
            display: flex;
            align-items: center;
        }
        .search-bar {
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin-right: 15px;
            font-size: 14px;
        }
        .auth-links a {
            text-decoration: none;
            color: #3498db;
            margin-left: 15px;
            font-size: 14px;
        }
        .auth-links a:hover {
            text-decoration: underline;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #3498db;
            text-decoration: none;
            font-size: 14px;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .term-detail {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            margin-bottom: 30px;
        }
        .term-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .term-title {
            margin: 0;
            font-size: 28px;
            color: #2c3e50;
        }
        .term-category {
            display: inline-block;
            background-color: #ecf0f1;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 5px;
        }
        .term-description {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }
        .term-details h2 {
            font-size: 22px;
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .term-details p {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 15px;
        }
        .term-details ul {
            padding-left: 20px;
        }
        .term-details li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .related-terms {
            background-color: white;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .related-terms h2 {
            font-size: 20px;
            color: #2c3e50;
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .related-terms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .related-term-card {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            background-color: #f9f9f9;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .related-term-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .related-term-card h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
            color: #2980b9;
        }
        .related-term-card .category {
            font-size: 12px;
            color: #7f8c8d;
            display: block;
            margin-bottom: 8px;
        }
        .related-term-card a {
            text-decoration: none;
            color: inherit;
        }
        footer {
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #777;
        }
        .references {
            margin-top: 30px;
        }
        .references h2 {
            font-size: 20px;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .references ul {
            padding-left: 20px;
        }
        .references li {
            margin-bottom: 10px;
        }
        .references a {
            color: #3498db;
            text-decoration: none;
        }
        .references a:hover {
            text-decoration: underline;
        }
        .add-term-btn {
            background-color: #3498db;
            color: white !important;
            padding: 8px 15px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin-right: 15px;
            transition: background-color 0.2s;
        }
        .add-term-btn:hover {
            background-color: #2980b9;
            text-decoration: none !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>테크 용어집</h1>
            <div class="header-right">
                <input type="search" class="search-bar" placeholder="용어 검색... (Ctrl + K)">
                <div class="auth-links">
                    <a href="../admin.html" class="add-term-btn">용어 추가</a>
                    <a href="#">로그인</a>
                    <a href="#">회원가입</a>
                </div>
            </div>
        </header>

        <a href="../index.html" class="back-link">← 목록으로 돌아가기</a>

        <section class="term-detail">
            <div class="term-header">
                <div>
                    <h1 class="term-title">${term}</h1>
                    <span class="term-category">${category}</span>
                </div>
            </div>
            
            <p class="term-description">${details.detailedDescription || ''}</p>
            
            <div class="term-details">
                <h2>주요 특징</h2>
                ${featuresHTML}
                
                <h2>활용 사례</h2>
                <p>${details.useCases || ''}</p>
                
                <h2>역사 및 배경</h2>
                <p>${details.history || ''}</p>
                
                <div class="references">
                    <h2>참고 자료</h2>
                    ${referencesHTML}
                </div>
            </div>
        </section>
        
        <section class="related-terms">
            <h2>관련 용어</h2>
            <div class="related-terms-grid">
                ${relatedTermsHTML}
            </div>
        </section>

        <footer>
            <p>&copy; 2025 테크 용어집. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`;
}

// 파일 저장 API 호출 함수
async function saveDetailPage(term, htmlContent) {
    try {
        const fileName = term.toLowerCase().replace(/\s+/g, '-');
        
        // 서버 API 호출
        const response = await fetch('/api/save-detail-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: fileName,
                content: htmlContent
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 오류: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`${term} 상세 페이지가 생성되었습니다.`);
        return data;
    } catch (error) {
        console.error('파일 저장 오류:', error);
        throw error;
    }
}

// 전체 프로세스 실행 함수
async function processNewTerm(term, category, description, apiKey) {
    try {
        // 1. OpenAI API를 사용해 상세 정보 생성
        const termDetails = await generateTermDetails(term, category, description, apiKey);
        
        // 2. HTML 상세 페이지 생성
        const htmlContent = generateDetailPageHTML(term, category, termDetails);
        
        // 3. 파일명 규칙에 따라 파일 경로 생성
        const fileName = term.toLowerCase().replace(/\s+/g, '-');
        const filePath = `detail/${fileName}.html`;
        
        // 4. 성공 응답 반환
        return {
            success: true,
            detailPagePath: filePath,
            termDetails: termDetails
        };
    } catch (error) {
        console.error('용어 처리 오류:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 모듈 내보내기
window.OpenAIHelper = {
    generateTermDetails,
    generateDetailPageHTML,
    processNewTerm
};