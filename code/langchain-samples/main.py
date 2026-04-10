import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_openai import ChatOpenAI

SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1"
DEFAULT_MODEL = "Qwen/Qwen3-8B"


def build_llm() -> ChatOpenAI:
    api_key = os.getenv("SILICON_API_KEY")
    if not api_key:
        raise RuntimeError("未读取到环境变量 SILICON_API_KEY")

    return ChatOpenAI(
        model=DEFAULT_MODEL,
        api_key=api_key,
        base_url=SILICONFLOW_BASE_URL,
        temperature=0.7,
    )


def message_text(message) -> str:
    content = getattr(message, "content", "")
    if isinstance(content, str):
        return content
    if hasattr(message, "text"):
        text_value = message.text
        return text_value() if callable(text_value) else str(text_value)
    return str(content)


def run_starter_example(llm: ChatOpenAI) -> None:
    topic = input("请输入一个想学习的主题，直接回车默认 LangChain：").strip() or "LangChain"
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个适合初学者的 AI 导师，请用简洁中文回答。"),
            ("human", "请围绕 {topic} 输出：1）它是什么；2）为什么有用；3）一个最小练习。"),
        ]
    )

    chain = prompt | llm
    response = chain.invoke({"topic": topic})

    print("\n=== 单轮入门示例 ===")
    print(message_text(response))


def run_chat_loop(llm: ChatOpenAI) -> None:
    print("\n=== 多轮聊天示例 ===")
    print("现在你可以继续追问。输入 exit 结束。\n")

    messages = [SystemMessage(content="你是一个适合初学者的 LangChain 助手，请用简洁中文回答。")]

    while True:
        user_input = input("你：").strip()
        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            print("已结束。")
            break

        messages.append(HumanMessage(content=user_input))
        response = llm.invoke(messages)
        answer = message_text(response)
        print(f"AI：{answer}\n")
        messages.append(response)


def main() -> None:
    print("LangChain + SiliconFlow 入门示例")
    print(f"当前模型：{DEFAULT_MODEL}")

    llm = build_llm()
    run_starter_example(llm)
    run_chat_loop(llm)


if __name__ == "__main__":
    main()
