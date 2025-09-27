// 聊天界面元素
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatContainer = document.getElementById('chat-container');
const clearChatBtn = document.getElementById('clear-chat-btn');
const quickQuestions = document.querySelectorAll('.quick-question');
const successToast = document.getElementById('success-toast');
const errorToast = document.getElementById('error-toast');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// API配置 - 完全按照curl模板配置
const API_URL = 'https://api.coze.cn/v3/chat?';
const API_TOKEN = 'pat_KXu4Wwa2VuyrOo2YxzdLNVgtoZgt8oANTFybMkHJVwioq7GgguDwFJuD951mvMwq';
const BOT_ID = '7553901337742802980';
const USER_ID = '123';

// 模拟回复数据，当API不可用时使用
const mockResponses = {
    study: [
        "提高学习效率的关键在于合理规划时间和保持专注。你可以尝试番茄工作法，每学习25分钟休息5分钟。",
        "课前预习和课后复习是巩固知识的好方法。每天花15-30分钟复习当天学习的内容，能大大提高记忆效果。",
        "制定清晰的学习目标，将大任务分解成小任务，每完成一个小任务给自己一个小奖励，保持学习动力。",
        "创造一个良好的学习环境，减少干扰因素，关闭手机通知，找一个安静的地方专注学习。",
        "不同的学科可能需要不同的学习方法，尝试找到适合自己的方法，比如做笔记、思维导图或小组讨论。"
    ],
    life: [
        "平衡学习和社交的关键是合理安排时间。可以制定一个时间表，既有学习时间也有社交时间。",
        "良好的睡眠和饮食习惯对保持身心健康非常重要。尽量保持规律的作息，每天保证7-8小时的睡眠。",
        "参与校园活动是拓展社交圈的好方法，可以根据自己的兴趣选择合适的社团或俱乐部。",
        "学会拒绝也是很重要的。如果感到压力过大，可以适当减少一些活动，优先完成重要的事情。",
        "保持积极的心态，遇到困难时不要轻易放弃，可以向朋友、家人或老师寻求帮助。"
    ],
    career: [
        "职业规划需要考虑自己的兴趣、能力和市场需求。可以通过实习、兼职等方式了解不同的职业。",
        "提前了解目标行业的发展趋势和技能要求，针对性地提升自己的能力和知识储备。",
        "建立专业的人脉网络，参加行业活动和讲座，关注行业动态，为未来的求职做好准备。",
        "制作一份专业的简历，突出自己的优势和实践经验。可以向学长学姐或就业指导中心寻求帮助。",
        "面试前充分准备，了解应聘公司的背景和岗位要求，准备常见问题的回答，展示自己的能力和潜力。"
    ],
    default: [
        "非常感谢你的提问！我会尽力为你提供帮助。",
        "这个问题很有意思，让我为你详细解答一下。",
        "我理解你的困惑，让我们一起来分析解决这个问题。",
        "根据我的了解，我可以给你一些建议，希望能帮到你。",
        "这是一个常见的问题，很多同学都会遇到，让我来为你解答。"
    ]
};

// 初始化页面
function init() {
    // 直接启用聊天功能，不需要登录
    enableChatFeatures();
    
    // 绑定事件监听
    bindEvents();
}

// 绑定事件监听
function bindEvents() {
    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 清空聊天记录
    clearChatBtn.addEventListener('click', clearChat);

    // 快捷问题
    quickQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent.trim();
            sendMessage();
        });
    });
}

// 启用聊天功能
function enableChatFeatures() {
    // 启用聊天功能
    userInput.disabled = false;
    sendBtn.disabled = false;
    quickQuestions.forEach(btn => {
        btn.disabled = false;
    });
}

// 添加用户消息到聊天框
function addUserMessage(message) {
    const userMessageHTML = `
        <div class="flex items-start justify-end space-x-3">
            <div class="bg-primary text-white rounded-lg rounded-tr-none p-3 max-w-[80%]">
                <p class="text-sm">${escapeHTML(message)}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                <i class="fa fa-user text-xs"></i>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', userMessageHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 添加AI消息到聊天框（仅用于显示打字指示器）
function addAIMessage(message, isTyping = false) {
    const aiMessageHTML = `
        <div class="flex items-start space-x-3 ai-message" ${isTyping ? 'id="typing-indicator"' : ''}>
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                <i class="fa fa-user-circle-o text-xs"></i>
            </div>
            <div class="bg-gray-50 rounded-lg rounded-tl-none p-3 max-w-[80%] border border-gray-100">
                <p class="text-sm">${isTyping ? '<span class="typing-dots"><span></span><span></span><span></span></span>' : escapeHTML(message)}</p>
            </div>
        </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', aiMessageHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 发送消息
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 添加用户消息到聊天框
    addUserMessage(message);

    // 清空输入框
    userInput.value = '';

    // 显示AI正在输入
    addAIMessage('', true);

    // 获取AI响应
    getAIResponse(message);
}

// 获取AI响应
async function getAIResponse(message) {
    try {
        // 创建请求体，完全按照curl模板的格式
        const requestBody = {
            bot_id: BOT_ID,
            user_id: USER_ID,
            stream: true,
            additional_messages: [
                {
                    "role": "user",
                    "type": "question",
                    "content_type": "text",
                    "content": message
                }
            ]
        };
        
        console.log('API调用配置:', { url: API_URL, headers: { Authorization: 'Bearer ***' } });
        console.log('请求体:', requestBody);
        
        // 使用fetch API直接调用扣子API，添加CORS处理
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(requestBody),
            credentials: 'include' // 包含凭证
        });
        
        console.log('响应状态:', response.status);
        
        // 移除打字指示器
        removeTypingIndicator();
        
        // 处理流式响应
        if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            
            // 创建AI消息元素
            const aiMessageElement = document.createElement('div');
            aiMessageElement.className = 'flex items-start space-x-3 ai-message';
            aiMessageElement.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i class="fa fa-user-circle-o text-xs"></i>
                </div>
                <div class="bg-gray-50 rounded-lg rounded-tl-none p-3 max-w-[80%] border border-gray-100">
                    <div class="text-sm streaming-content"></div>
                </div>
            `;
            chatContainer.appendChild(aiMessageElement);
            const streamingContent = aiMessageElement.querySelector('.streaming-content');
            
            // 读取流式数据
            while (true) {
                try {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        // 流读取完成
                        console.log('流式响应完成:', fullResponse);
                        break;
                    }
                    
                    const chunk = decoder.decode(value, { stream: true });
                    // 处理扣子API的流式响应格式
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.trim() === '' || line.trim() === 'data: [DONE]') {
                            continue;
                        }
                        
                        if (line.startsWith('data:')) {
                            try {
                                // 解析data: 后面的JSON数据 - 改进的错误处理
                                const dataText = line.substring(5).trim();
                                
                                // 尝试安全解析JSON，如果失败则进行错误处理
                                let data;
                                try {
                                    data = JSON.parse(dataText);
                                } catch (parseError) {
                                    // 处理不完整JSON的情况
                                    console.warn('JSON解析警告:', parseError.message, '尝试部分解析');
                                    continue; // 跳过无法解析的行
                                }
                                
                                // 检查多种可能的内容字段格式
                                let content = '';
                                if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                                    // OpenAI兼容格式
                                    content = data.choices[0].message.content;
                                } else if (data.content) {
                                    // 直接content字段
                                    content = data.content;
                                } else if (data.data && data.data.content) {
                                    // 扣子API格式
                                    content = data.data.content;
                                } else if (data.type === 'verbose' && data.content) {
                                    // 处理verbose类型的响应
                                    try {
                                        const contentObj = JSON.parse(data.content);
                                        if (contentObj.msg_type === 'text' && contentObj.content) {
                                            content = contentObj.content;
                                        }
                                    } catch (contentParseError) {
                                        console.warn('内容解析错误:', contentParseError);
                                    }
                                }
                                
                                // 更健壮的消息更新逻辑
                                if (content && content.trim() && streamingContent) {
                                    fullResponse = content;
                                    try {
                                        streamingContent.textContent = fullResponse;
                                        streamingContent.innerHTML = parseMarkdown(fullResponse);
                                        chatContainer.scrollTop = chatContainer.scrollHeight;
                                    } catch (renderError) {
                                        console.error('渲染错误:', renderError);
                                        streamingContent.textContent = fullResponse; // 降级到纯文本
                                    }
                                }
                            } catch (e) {
                                console.error('处理响应行失败:', e, '行内容:', line.length > 100 ? line.substring(0, 100) + '...' : line);
                            }
                        }
                    }
                } catch (readError) {
                    console.error('读取流时出错:', readError);
                    break; // 发生错误时退出循环
                }
            }
            
            // 确保有内容展示
            if (!fullResponse && streamingContent) {
                const fallbackMessage = "抱歉，我无法获取到完整的响应。让我尝试用其他方式为你解答。";
                streamingContent.textContent = fallbackMessage;
                fullResponse = fallbackMessage;
            }
            
            return fullResponse;
        } else {
            // 处理错误响应
            const errorText = await response.text().catch(() => '无法获取错误详情');
            console.error('API错误响应:', errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText);
            throw new Error(`API调用失败: ${response.status} ${errorText.length > 50 ? errorText.substring(0, 50) + '...' : errorText}`);
        }
    } catch (error) {
        console.error('获取AI响应失败:', error);
        // 移除打字指示器
        removeTypingIndicator();
        
        // 当API调用失败时，使用模拟回复
        const mockResponse = generateMockResponse(message);
        showAIMessageWithMarkdown(mockResponse);
        
        // 根据错误类型显示不同的提示信息
        if (error.name === 'TypeError') {
            if (error.message.includes('Failed to fetch')) {
                showErrorMessage('网络连接失败，请检查网络设置');
            } else if (error.message.includes('network')) {
                showErrorMessage('网络连接异常，使用模拟回复');
            } else {
                showErrorMessage('发生技术错误，使用模拟回复');
            }
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            showErrorMessage('认证失败，请检查API凭证');
        } else {
            showErrorMessage('连接服务器失败，使用模拟回复');
        }
        
        return mockResponse;
    }
}

// 移除打字指示器
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}


// 显示AI消息（用于非流式响应）
function showAIMessageWithMarkdown(message) {
    // 创建新的AI消息容器
    const aiMessageElement = document.createElement('div');
    aiMessageElement.className = 'flex items-start space-x-3 ai-message';
    aiMessageElement.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
            <i class="fa fa-user-circle-o text-xs"></i>
        </div>
        <div class="bg-gray-50 rounded-lg rounded-tl-none p-3 max-w-[80%] border border-gray-100">
            <div class="text-sm">${parseMarkdown(message)}</div>
        </div>
    `;
    chatContainer.appendChild(aiMessageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Markdown解析函数
function parseMarkdown(text) {
    // 转义HTML以防止XSS攻击
    text = escapeHTML(text);
    
    // 处理标题 # H1, ## H2, ### H3
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-3 mb-1.5">$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-md font-bold mt-2 mb-1">$1</h3>');
    
    // 处理加粗 **text** 或 __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // 处理斜体 *text* 或 _text_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // 处理代码块 ```code```
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-2 rounded overflow-x-auto my-2"><code>$1</code></pre>');
    
    // 处理行内代码 `code`
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    
    // 处理无序列表 - item
    text = text.replace(/^- (.*$)/gm, '<ul class="list-disc pl-5 my-1"><li>$1</li></ul>');
    
    // 处理有序列表 1. item
    text = text.replace(/^\d+\. (.*$)/gm, '<ol class="list-decimal pl-5 my-1"><li>$1</li></ol>');
    
    // 处理链接 [text](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');
    
    // 处理段落（通过换行符）
    text = text.replace(/^(?!<h[1-6]>|<ul>|<ol>|<pre>)(.*$)/gm, '<p>$1</p>');
    
    // 处理多余的空行
    text = text.replace(/\n\n+/g, '\n');
    
    // 合并相邻的列表项
    text = text.replace(/<\/li><\/ul>\s*<ul class="list-disc pl-5 my-1"><li>/g, ', ');
    text = text.replace(/<\/li><\/ol>\s*<ol class="list-decimal pl-5 my-1"><li>/g, ', ');
    
    return text;
}

// 生成模拟回复
function generateMockResponse(message) {
    // 将消息转换为小写进行匹配
    const lowerMessage = message.toLowerCase();
    
    // 根据消息内容选择合适的回复分类
    let category = 'default';
    if (lowerMessage.includes('学习') || lowerMessage.includes('效率') || lowerMessage.includes('复习') || lowerMessage.includes('考试') || lowerMessage.includes('作业') || lowerMessage.includes('成绩') || lowerMessage.includes('课程')) {
        category = 'study';
    } else if (lowerMessage.includes('生活') || lowerMessage.includes('社交') || lowerMessage.includes('平衡') || lowerMessage.includes('健康') || lowerMessage.includes('压力') || lowerMessage.includes('宿舍') || lowerMessage.includes('朋友')) {
        category = 'life';
    } else if (lowerMessage.includes('职业') || lowerMessage.includes('规划') || lowerMessage.includes('实习') || lowerMessage.includes('求职') || lowerMessage.includes('简历') || lowerMessage.includes('工作') || lowerMessage.includes('就业')) {
        category = 'career';
    }
    
    // 从对应分类中随机选择一个回复
    const responses = mockResponses[category];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}

// 清空聊天记录
function clearChat() {
    // 清空聊天容器，但保留欢迎消息
    const welcomeMessage = chatContainer.querySelector('.ai-message').outerHTML;
    chatContainer.innerHTML = welcomeMessage;
    
    showSuccessMessage('聊天记录已清空');
}

// 显示成功消息
function showSuccessMessage(message) {
    successMessage.textContent = message;
    successToast.classList.remove('translate-y-16', 'opacity-0');
    
    setTimeout(() => {
        successToast.classList.add('translate-y-16', 'opacity-0');
    });
}

// 显示错误消息
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorToast.classList.remove('translate-y-16', 'opacity-0');
    
    setTimeout(() => {
        errorToast.classList.add('translate-y-16', 'opacity-0');
    });
}

// HTML转义函数
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载完成后初始化
window.addEventListener('load', init);