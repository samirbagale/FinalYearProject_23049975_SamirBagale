const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
    const key = process.env.GEMINI_API_KEY || 'AIzaSyAH8IUYGSLpUi68BFhpT8nRsJiCt3lqo3I';
    const genAI = new GoogleGenerativeAI(key);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello!");
        console.log("gemini-1.5-flash works:", result.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash failed:");
        console.error(e);
    }
}

run();
