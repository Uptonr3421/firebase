# MODEL COMPARISON BENTO

A comprehensive, LLM-friendly reference for all major models, providers, and risk/guardrail notes relevant to the Bespoke Ethos multi-agent AI platform. This chart is designed for both human and agentic consumption, supporting future-safe model selection, risk management, and deployment planning.

---

## Model Bento Chart

| Model Name        | Provider/API             | Family/Type      | Context Window | Storytelling Ability | Guardrails/Moderation | NSFW Risk |   Cost (API/Local)    | Blind Spots / High-Risk Areas                                                    |
| ----------------- | ------------------------ | ---------------- | :------------: | :------------------: | :-------------------: | :-------: | :-------------------: | :------------------------------------------------------------------------------- |
| Llama 3 70B       | Ollama, Groq, OpenRouter | Open (Meta)      |    8K-128K     |        ★★★★★         |     Minimal/None      |   High    | $ (API), Free (local) | Will output NSFW, violence, hate, self-harm if prompted; no built-in moderation. |
| Llama 2 70B       | Ollama, OpenRouter       | Open (Meta)      |     4K-32K     |        ★★★★☆         |     Minimal/None      |   High    | $ (API), Free (local) | Similar to Llama 3; less context, slightly less creative.                        |
| Mistral Large     | Groq, OpenRouter         | Open (Mistral)   |    32K-128K    |        ★★★★☆         |     Minimal/None      |   High    | $ (API), Free (local) | Will output NSFW, violence, hate, self-harm if prompted.                         |
| Mistral Medium    | Groq, OpenRouter         | Open (Mistral)   |      32K       |        ★★★★☆         |     Minimal/None      |   High    | $ (API), Free (local) | Similar to Large, slightly less creative.                                        |
| Mistral Small     | Ollama, OpenRouter       | Open (Mistral)   |       8K       |        ★★★☆☆         |     Minimal/None      |   High    | $ (API), Free (local) | Lower reasoning, but still no guardrails.                                        |
| Phi-3             | Groq, OpenRouter         | Open (Microsoft) |      128K      |        ★★★☆☆         |     Minimal/None      |   High    | $ (API), Free (local) | Will output NSFW, but less creative.                                             |
| Jamba (AI21)      | OpenRouter               | Open (AI21)      |      256K      |        ★★★★☆         |     Minimal/None      |   High    |        $ (API)        | Will output NSFW, but less common.                                               |
| Cohere Command R+ | Cohere                   | Commercial       |      128K      |        ★★★☆☆         |       Moderate        |  Medium   |       $$ (API)        | Some filtering, but can be bypassed.                                             |
| Grok-1            | xAI, OpenRouter          | Commercial       |      128K      |        ★★★★☆         |     Minimal/None      |   High    |       $$ (API)        | Will output NSFW, but less creative.                                             |
| Jais              | OpenRouter               | Open (G42)       |      128K      |        ★★★☆☆         |     Minimal/None      |   High    |        $ (API)        | Will output NSFW, but less creative.                                             |
| Codestral         | Groq, OpenRouter         | Open (Mistral)   |      32K       |      N/A (Code)      |     Minimal/None      |   High    | $ (API), Free (local) | Will output unsafe code if prompted.                                             |
| Gemini 1.5 Pro    | Vertex AI, Google        | Commercial       |       1M       |        ★★★★☆         |        Strong         |    Low    |       $$$ (API)       | Refuses NSFW, violence, hate, self-harm.                                         |
| GPT-4o            | OpenAI, Groq             | Commercial       |      128K      |        ★★★★★         |        Strong         |    Low    |       $$$ (API)       | Refuses NSFW, violence, hate, self-harm.                                         |
| GPT-3.5 Turbo     | OpenAI, Groq             | Commercial       |      16K       |        ★★★★☆         |        Strong         |    Low    |       $$ (API)        | Refuses NSFW, violence, hate, self-harm.                                         |
| Claude 3 Opus     | Anthropic, Groq          | Commercial       |      200K      |        ★★★★★         |        Strong         |    Low    |       $$$ (API)       | Refuses NSFW, violence, hate, self-harm.                                         |
| Claude 3 Sonnet   | Anthropic, Groq          | Commercial       |      200K      |        ★★★★☆         |        Strong         |    Low    |       $$ (API)        | Refuses NSFW, violence, hate, self-harm.                                         |
| Claude 3 Haiku    | Anthropic, Groq          | Commercial       |      200K      |        ★★★☆☆         |        Strong         |    Low    |        $ (API)        | Refuses NSFW, violence, hate, self-harm.                                         |

---

## Key

- **Storytelling Ability**: Subjective rating of creative, narrative, and roleplay output (★ = lowest, ★★★★★ = highest).
- **Guardrails/Moderation**: Indicates if the model has built-in content moderation or refusal mechanisms.
- **NSFW Risk**: High = will output unsafe content if prompted; Low = strong refusals.
- **Cost**: $ = low, $$ = moderate, $$$ = high; "Free (local)" means can be run on local hardware with no API cost.
- **Blind Spots / High-Risk Areas**: Where the model is most likely to output unsafe, unfiltered, or problematic content. Use this to inform where to install custom guardrails.

---

## Notes

- **Open models** (Llama, Mistral, Phi, Jamba, Codestral, Jais) have minimal or no built-in moderation. They will output NSFW, hate, violence, or self-harm content if prompted. Use with custom guardrails.
- **Commercial models** (Gemini, GPT, Claude, Cohere) have strong built-in moderation and will refuse unsafe requests.
- **Local deployment** (Ollama, LM Studio) is possible for most open models, enabling privacy and cost savings but requiring your own safety layer.
- **API providers** (Groq, OpenRouter, xAI, Vertex AI, OpenAI, Anthropic, Cohere) vary in cost, speed, and reliability. See provider docs for rate limits and terms.
- **Always test models with your own prompts to validate risk and coverage.**

---

_Last updated: 2025-12-19_
