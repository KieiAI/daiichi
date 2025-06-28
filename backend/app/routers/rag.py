from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
from typing import List, Dict, Any
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores.azuresearch import AzureSearch
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AZURE_API_KEY = os.getenv("AZURE_API_KEY")
AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AZURE_INDEX_NAME = os.getenv("AZURE_INDEX_NAME")
VECTOR_DIM = 3072

class RAGRequest(BaseModel):
    task: str
    element: str

def get_openai_embedding(input_text: str) -> List[float]:
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY, model="text-embedding-3-large")
    return embeddings.embed_query(input_text)

def search_azure_vector(text: str) -> List[Dict[str, Any]]:
    vectorstore = AzureSearch(
      azure_search_endpoint=AZURE_SEARCH_ENDPOINT,
      azure_search_key=AZURE_API_KEY,
      index_name=AZURE_INDEX_NAME,
      embedding_function=OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY, model="text-embedding-3-large"),
      fields={"vector": "contentVector"}
    )
    docs_and_scores = vectorstore.similarity_search_with_score(text, k=10)
    docs = [doc for doc, _ in docs_and_scores]
    return docs
def build_function_def(file_names: List[str]) -> list:
    return [
        {
            "name": "output_safety_risks_and_controls",
            "description": "危険性・有害性・リスク低減措置・対策分類・使用ナレッジファイル名をrags/llmsに分けて返す",
            "parameters": {
                "type": "object",
                "properties": {
                    "rags": {
                        "type": "array",
                        "description": "参考事例を元にした危険性・有害性等の配列（最大5件）",
                        "items": {
                            "type": "object",
                            "properties": {
                                "危険性・有害性": {"type": "string"},
                                "リスク低減措置": {"type": "string"},
                                "対策分類": {
                                    "type": "string",
                                    "enum": ["設計時対策", "工学的対策", "管理的対策", "個人用保護具"]
                                },
                                "使用ナレッジファイル名": {
                                    "type": "string",
                                    "enum": file_names
                                }
                            },
                            "required": ["危険性・有害性", "リスク低減措置", "対策分類", "使用ナレッジファイル名"]
                        },
                        "maxItems": 5
                    },
                    "llms": {
                        "type": "array",
                        "description": "LLMによる生成の危険性・有害性等の配列（最大5件）",
                        "items": {
                            "type": "object",
                            "properties": {
                                "危険性・有害性": {"type": "string"},
                                "リスク低減措置": {"type": "string"},
                                "対策分類": {
                                    "type": "string",
                                    "enum": ["設計時対策", "工学的対策", "管理的対策", "個人用保護具"]
                                },
                                "使用ナレッジファイル名": {
                                    "type": "string",
                                    "enum": ["LLMによる生成"]
                                }
                            },
                            "required": ["危険性・有害性", "リスク低減措置", "対策分類", "使用ナレッジファイル名"]
                        },
                        "maxItems": 5
                    }
                },
                "required": ["rags", "llms"]
            }
        }
    ]

def build_prompt(task: str, element: str, examples: str) -> str:
    return f"""
次の作業と作業要素について、「新たに想定される危険性・有害性」と「リスク低減措置」を
必ず合計10件、以下のように2つのグループに分けて構造化して出力してください。
各組には必ず「もっとも関連性の高い（類似度スコアが高い）ナレッジファイル名」を1つ選び、併記してください。
ただし、危険性・有害性とリスク低減措置については体言止めを用いず、全て文章形式で出力してください。

1. "rags"配列 (過去の参考事例から5件): 
  - 下記の「参考事例」を必ず参考にして5件出力してください。
  - それぞれ必ず「もっとも関連性の高い（類似度スコアが高い）ナレッジファイル名」にしたファイル名を「使用ナレッジファイル名」として記載してください。

2. "llms"配列 (あなた自身の知識や推論のみで5件): 
  - 下記の「参考事例」は一切使用せず、あなた自身の知識と推論のみで5件出力してください。
  - 「使用ナレッジファイル名」には「LLMによる生成」と記載してください。

どちらも配列の順番は1件目から順に昇順で並べてください。

出力例：
{{
  "rags": [
    {{
      "危険性・有害性": "...",
      "リスク低減措置": "...",
      "対策分類": "...",
      "使用ナレッジファイル名": "..."
    }},
    ...
  ],
  "llms": [
    {{
      "危険性・有害性": "...",
      "リスク低減措置": "...",
      "対策分類": "...",
      "使用ナレッジファイル名": "LLMによる生成"
    }},
    ...
  ]
}}

# 作業: {task}
# 作業要素: {element}

【参考事例】
{examples}

出力は必ず上記JSON形式（オブジェクトで"rags"と"llms"の2配列を持つ）でお願いします。
"""

def call_chatgpt_with_function_calling(prompt: str, function_def: list) -> str:
    llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4-1106-preview", temperature=0)
    messages = [
        SystemMessage(content="あなたは労働安全衛生の専門家です。"),
        HumanMessage(content=prompt)
    ]
    # LangChainのChatOpenAIはfunction_call直接指定は未対応のため、プロンプトで誘導
    response = llm(messages)
    return response.content

@router.post("/")
def run_rag_full4(req: RAGRequest):
    task = req.task.strip()
    element = req.element.strip()
    if not task or not element:
        raise HTTPException(status_code=400, detail="task/elementが未入力です")

    input_text = f"""
作業名: {task}
この作業に含まれる作業要素の一例として「{element}」があります。
"""
    # embedding = get_openai_embedding(input_text)
    # if not embedding or len(embedding) != VECTOR_DIM:
    #     raise HTTPException(status_code=500, detail="埋め込み生成に失敗しました")

    docs = search_azure_vector(input_text)

    if not docs:
        return {"message": "類似事例が見つかりませんでした。", "results": []}

    file_names = list({doc.metadata.get("file_name") for doc in docs if doc.metadata.get("file_name")})[:10]

    examples = "\n".join([
        f"{i+1}. 危険性: {doc.metadata.get('hazard')}\n   リスク低減措置: {doc.metadata.get('risk_mitigation')}\n   ファイル名: {doc.metadata.get('file_name')}"
        for i, doc in enumerate(docs[:10])
    ])

    # 5. function calling用の関数定義
    function_def = build_function_def(file_names)

    # 6. AIプロンプト
    prompt = build_prompt(task, element, examples)

    response = call_chatgpt_with_function_calling(prompt, function_def)

    try:
        result = json.loads(response)
        return result
    except Exception:
        return {"raw_response": response}