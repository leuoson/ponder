import { z } from "zod"

import { toolGroupsSchema } from "./tool.js"

/**
 * GroupOptions
 */

export const groupOptionsSchema = z.object({
	fileRegex: z
		.string()
		.optional()
		.refine(
			(pattern) => {
				if (!pattern) {
					return true // Optional, so empty is valid.
				}

				try {
					new RegExp(pattern)
					return true
				} catch {
					return false
				}
			},
			{ message: "Invalid regular expression pattern" },
		),
	description: z.string().optional(),
})

export type GroupOptions = z.infer<typeof groupOptionsSchema>

/**
 * GroupEntry
 */

export const groupEntrySchema = z.union([toolGroupsSchema, z.tuple([toolGroupsSchema, groupOptionsSchema])])

export type GroupEntry = z.infer<typeof groupEntrySchema>

/**
 * ModeConfig
 */

const groupEntryArraySchema = z.array(groupEntrySchema).refine(
	(groups) => {
		const seen = new Set()

		return groups.every((group) => {
			// For tuples, check the group name (first element).
			const groupName = Array.isArray(group) ? group[0] : group

			if (seen.has(groupName)) {
				return false
			}

			seen.add(groupName)
			return true
		})
	},
	{ message: "Duplicate groups are not allowed" },
)

/**
 * ModeI18nData - Internationalization data for a specific locale
 */
export const modeI18nDataSchema = z
	.object({
		name: z.string().optional(),
		description: z.string().optional(),
		// Future extensible fields:
		// roleDefinition: z.string().optional(),
		// whenToUse: z.string().optional(),
		// customInstructions: z.string().optional(),
	})
	.strict()

export type ModeI18nData = z.infer<typeof modeI18nDataSchema>

/**
 * ModeI18nConfig - Collection of internationalization data keyed by locale
 */
export const modeI18nConfigSchema = z.record(z.string(), modeI18nDataSchema.optional())

export type ModeI18nConfig = z.infer<typeof modeI18nConfigSchema>

export const modeConfigSchema = z.object({
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),
	name: z.string().min(1, "Name is required"),
	roleDefinition: z.string().min(1, "Role definition is required"),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
	groups: groupEntryArraySchema,
	source: z.enum(["global", "project"]).optional(),
	i18n: modeI18nConfigSchema.optional(),
})

export type ModeConfig = z.infer<typeof modeConfigSchema>

/**
 * CustomModesSettings
 */

export const customModesSettingsSchema = z.object({
	customModes: z.array(modeConfigSchema).refine(
		(modes) => {
			const slugs = new Set()

			return modes.every((mode) => {
				if (slugs.has(mode.slug)) {
					return false
				}

				slugs.add(mode.slug)
				return true
			})
		},
		{
			message: "Duplicate mode slugs are not allowed",
		},
	),
})

export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>

/**
 * PromptComponent
 */

export const promptComponentSchema = z.object({
	roleDefinition: z.string().optional(),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
})

export type PromptComponent = z.infer<typeof promptComponentSchema>

/**
 * CustomModePrompts
 */

export const customModePromptsSchema = z.record(z.string(), promptComponentSchema.optional())

export type CustomModePrompts = z.infer<typeof customModePromptsSchema>

/**
 * CustomSupportPrompts
 */

export const customSupportPromptsSchema = z.record(z.string(), z.string().optional())

export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>

/**
 * DEFAULT_MODES
 */

export const DEFAULT_MODES: readonly ModeConfig[] = [
	{
		slug: "planner",
		name: "📋 Planner",
		roleDefinition:
			"You are Ponder, an experienced content strategist who is inquisitive and an excellent planner. Your goal is to gather information and get context to create a detailed plan for accomplishing the user's writing task, which the user will review and approve before they switch into another mode to implement the solution.",
		whenToUse:
			"Use this mode when you need to plan, design, or strategize before writing. Perfect for breaking down complex writing projects, creating content outlines, designing article structures, or brainstorming ideas before drafting.",
		description: "Plan and design before writing",
		groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
		customInstructions:
			"1. Do some information gathering (using provided tools) to get more context about the writing task.\n\n2. You should also ask the user clarifying questions to get a better understanding of the task.\n\n3. Once you've gained more context about the user's request, break down the task into clear, actionable steps and create a todo list using the `update_todo_list` tool. Each todo item should be:\n   - Specific and actionable\n   - Listed in logical execution order\n   - Focused on a single, well-defined outcome\n   - Clear enough that another mode could execute it independently\n\n   **Note:** If the `update_todo_list` tool is not available, write the plan to a markdown file (e.g., `plan.md` or `todo.md`) instead.\n\n4. As you gather more information or discover new requirements, update the todo list to reflect the current understanding of what needs to be accomplished.\n\n5. Ask the user if they are pleased with this plan, or if they would like to make any changes. Think of this as a brainstorming session where you can discuss the task and refine the todo list.\n\n6. Include Mermaid diagrams if they help clarify complex workflows or content structure.\n\n7. Use the switch_mode tool to request that the user switch to another mode to implement the solution.\n\n**IMPORTANT: Focus on creating clear, actionable todo lists rather than lengthy markdown documents. Use the todo list as your primary planning tool to track and organize the work that needs to be done.**",
		i18n: {
			ca: {
				name: "📋 Planificador",
				description: "Planifica i dissenya abans d'escriure",
			},
			de: {
				name: "📋 Planer",
				description: "Planen und entwerfen vor dem Schreiben",
			},
			es: {
				name: "📋 Planificador",
				description: "Planifica y diseña antes de escribir",
			},
			fr: {
				name: "📋 Planificateur",
				description: "Planifier et concevoir avant d'écrire",
			},
			hi: {
				name: "📋 योजनाकार",
				description: "लिखने से पहले योजना बनाएं और डिज़ाइन करें",
			},
			id: {
				name: "📋 Perencana",
				description: "Merencanakan dan merancang sebelum menulis",
			},
			it: {
				name: "📋 Pianificatore",
				description: "Pianifica e progetta prima di scrivere",
			},
			ja: {
				name: "📋 プランナー",
				description: "執筆前の計画と設計",
			},
			ko: {
				name: "📋 기획자",
				description: "작성하기 전에 계획하고 설계하기",
			},
			nl: {
				name: "📋 Planner",
				description: "Plan en ontwerp voordat je schrijft",
			},
			pl: {
				name: "📋 Planista",
				description: "Planuj i projektuj przed pisaniem",
			},
			"pt-BR": {
				name: "📋 Planejador",
				description: "Planejar e projetar antes de escrever",
			},
			ru: {
				name: "📋 Планировщик",
				description: "Планирование и проектирование перед написанием",
			},
			tr: {
				name: "📋 Planlayıcı",
				description: "Yazmadan önce planlayın ve tasarlayın",
			},
			vi: {
				name: "📋 Người lập kế hoạch",
				description: "Lập kế hoạch và thiết kế trước khi viết",
			},
			"zh-CN": {
				name: "📋 规划师",
				description: "写作前的规划和设计",
			},
			"zh-TW": {
				name: "📋 規劃師",
				description: "寫作前的規劃和設計",
			},
		},
	},
	{
		slug: "writer",
		name: "✍️ Writer",
		roleDefinition:
			"You are Ponder, a highly skilled writer with extensive knowledge in many writing styles, genres, formats, and best practices. You excel at both creating new content and improving existing text.",
		whenToUse:
			"Use this mode when you need to write, modify, edit, or refactor content. Ideal for creating new articles, improving existing text, fixing writing issues, or making content improvements across any writing format or style.",
		description: "Write, edit, and refactor content",
		groups: ["read", "edit", "browser", "command", "mcp"],
		customInstructions:
			"1. For new content: Focus on creating clear, engaging, and well-structured writing that matches the intended audience and purpose.\n2. For existing content: Review systematically for grammar, clarity, flow, and effectiveness while preserving the author's voice.\n3. Maintain consistent voice, tone, and style throughout the writing.\n4. Pay attention to readability, logical organization, and impact.\n5. Use appropriate formatting and structure for the content type.\n6. Incorporate research and sources naturally when needed.\n7. Provide specific, actionable suggestions for improvement when editing.\n8. Adapt writing style to match project requirements and target audience.",
		i18n: {
			ca: {
				name: "✍️ Escriptor",
				description: "Escriu, edita i refactoritza contingut",
			},
			de: {
				name: "✍️ Schreiber",
				description: "Schreiben, bearbeiten und überarbeiten von Inhalten",
			},
			es: {
				name: "✍️ Escritor",
				description: "Escribir, editar y refactorizar contenido",
			},
			fr: {
				name: "✍️ Rédacteur",
				description: "Écrire, éditer et refactoriser le contenu",
			},
			hi: {
				name: "✍️ लेखक",
				description: "सामग्री लिखना, संपादित करना और पुनर्गठन करना",
			},
			id: {
				name: "✍️ Penulis",
				description: "Menulis, mengedit, dan merestrukturisasi konten",
			},
			it: {
				name: "✍️ Scrittore",
				description: "Scrivere, modificare e ristrutturare contenuti",
			},
			ja: {
				name: "✍️ ライター",
				description: "コンテンツの執筆、編集、リファクタリング",
			},
			ko: {
				name: "✍️ 작가",
				description: "콘텐츠 작성, 편집 및 리팩토링",
			},
			nl: {
				name: "✍️ Schrijver",
				description: "Schrijven, bewerken en herstructureren van content",
			},
			pl: {
				name: "✍️ Pisarz",
				description: "Pisanie, edytowanie i refaktoryzacja treści",
			},
			"pt-BR": {
				name: "✍️ Escritor",
				description: "Escrever, editar e refatorar conteúdo",
			},
			ru: {
				name: "✍️ Писатель",
				description: "Написание, редактирование и рефакторинг контента",
			},
			tr: {
				name: "✍️ Yazar",
				description: "İçerik yazma, düzenleme ve yeniden yapılandırma",
			},
			vi: {
				name: "✍️ Người viết",
				description: "Viết, chỉnh sửa và tái cấu trúc nội dung",
			},
			"zh-CN": {
				name: "✍️ 写作师",
				description: "写作、编辑和重构内容",
			},
			"zh-TW": {
				name: "✍️ 寫作師",
				description: "寫作、編輯和重構內容",
			},
		},
	},
	{
		slug: "researcher",
		name: "🔍 Researcher",
		roleDefinition:
			"You are Ponder, a thorough researcher skilled at finding, evaluating, and synthesizing information from various sources to support writing projects.",
		whenToUse:
			"Use this mode when you need to research topics, gather information, verify facts, or find sources for your writing. Perfect for academic writing, journalism, or any content requiring factual accuracy and credible sources.",
		description: "Research and gather information",
		groups: [
			"read",
			["edit", { fileRegex: "\\.(md|txt)$", description: "Research notes and documents" }],
			"browser",
			"mcp",
		],
		customInstructions:
			"1. Conduct systematic research using available tools and sources.\n2. Evaluate source credibility and relevance to the writing project.\n3. Organize findings clearly and cite sources properly.\n4. Create research summaries and bibliographies when needed.\n5. Identify gaps in information and suggest additional research directions.\n6. Present complex information in an accessible format for the writing project.",
		i18n: {
			ca: {
				name: "🔍 Investigador",
				description: "Investigar i recopilar informació",
			},
			de: {
				name: "🔍 Forscher",
				description: "Recherchieren und Informationen sammeln",
			},
			es: {
				name: "🔍 Investigador",
				description: "Investigar y recopilar información",
			},
			fr: {
				name: "🔍 Chercheur",
				description: "Rechercher et rassembler des informations",
			},
			hi: {
				name: "🔍 शोधकर्ता",
				description: "अनुसंधान और जानकारी एकत्र करना",
			},
			id: {
				name: "🔍 Peneliti",
				description: "Meneliti dan mengumpulkan informasi",
			},
			it: {
				name: "🔍 Ricercatore",
				description: "Ricercare e raccogliere informazioni",
			},
			ja: {
				name: "🔍 リサーチャー",
				description: "調査と情報収集",
			},
			ko: {
				name: "🔍 연구원",
				description: "연구 및 정보 수집",
			},
			nl: {
				name: "🔍 Onderzoeker",
				description: "Onderzoeken en informatie verzamelen",
			},
			pl: {
				name: "🔍 Badacz",
				description: "Badanie i zbieranie informacji",
			},
			"pt-BR": {
				name: "🔍 Pesquisador",
				description: "Pesquisar e coletar informações",
			},
			ru: {
				name: "🔍 Исследователь",
				description: "Исследование и сбор информации",
			},
			tr: {
				name: "🔍 Araştırmacı",
				description: "Araştırma yapma ve bilgi toplama",
			},
			vi: {
				name: "🔍 Nhà nghiên cứu",
				description: "Nghiên cứu và thu thập thông tin",
			},
			"zh-CN": {
				name: "🔍 研究员",
				description: "研究和收集信息",
			},
			"zh-TW": {
				name: "🔍 研究員",
				description: "研究和收集資訊",
			},
		},
	},
	{
		slug: "ask",
		name: "❓ Ask",
		roleDefinition:
			"You are Ponder, a knowledgeable writing assistant focused on answering questions and providing information about writing techniques, grammar, style, publishing, and related topics.",
		whenToUse:
			"Use this mode when you need explanations, guidance, or answers to writing-related questions. Best for understanding writing concepts, analyzing existing content, getting recommendations, or learning about writing techniques without making changes.",
		description: "Get writing advice and explanations",
		groups: ["read", "browser", "mcp"],
		customInstructions:
			"You can analyze content, explain writing concepts, and access external resources. Always answer the user's questions thoroughly, and do not switch to implementing changes unless explicitly requested by the user. Include diagrams when they clarify your response.",
		i18n: {
			ca: {
				name: "❓ Assistent de preguntes",
				description: "Obtenir consells d'escriptura i explicacions",
			},
			de: {
				name: "❓ Frage-Assistent",
				description: "Schreibberatung und Erklärungen erhalten",
			},
			es: {
				name: "❓ Asistente de preguntas",
				description: "Obtener consejos de escritura y explicaciones",
			},
			fr: {
				name: "❓ Assistant de questions",
				description: "Obtenir des conseils d'écriture et des explications",
			},
			hi: {
				name: "❓ प्रश्न सहायक",
				description: "लेखन सलाह और स्पष्टीकरण प्राप्त करें",
			},
			id: {
				name: "❓ Asisten pertanyaan",
				description: "Mendapatkan saran menulis dan penjelasan",
			},
			it: {
				name: "❓ Assistente domande",
				description: "Ottenere consigli di scrittura e spiegazioni",
			},
			ja: {
				name: "❓ 質問アシスタント",
				description: "ライティングのアドバイスと説明を取得",
			},
			ko: {
				name: "❓ 질문 도우미",
				description: "글쓰기 조언과 설명 얻기",
			},
			nl: {
				name: "❓ Vraag-assistent",
				description: "Schrijfadvies en uitleg krijgen",
			},
			pl: {
				name: "❓ Asystent pytań",
				description: "Uzyskiwanie porad dotyczących pisania i wyjaśnień",
			},
			"pt-BR": {
				name: "❓ Assistente de perguntas",
				description: "Obter conselhos de escrita e explicações",
			},
			ru: {
				name: "❓ Помощник вопросов",
				description: "Получение советов по написанию и объяснений",
			},
			tr: {
				name: "❓ Soru asistanı",
				description: "Yazma tavsiyeleri ve açıklamalar alma",
			},
			vi: {
				name: "❓ Trợ lý câu hỏi",
				description: "Nhận lời khuyên viết và giải thích",
			},
			"zh-CN": {
				name: "❓ 问答助手",
				description: "获取写作建议和解释",
			},
			"zh-TW": {
				name: "❓ 問答助手",
				description: "獲取寫作建議和解釋",
			},
		},
	},
	{
		slug: "orchestrator",
		name: "🎯 Orchestrator",
		roleDefinition:
			"You are Ponder, a strategic workflow orchestrator who coordinates complex writing projects by delegating them to appropriate specialized modes. You have a comprehensive understanding of each mode's capabilities and limitations, allowing you to effectively break down complex writing projects into discrete tasks that can be solved by different specialists.",
		whenToUse:
			"Use this mode for complex, multi-step writing projects that require coordination across different specialties. Ideal when you need to break down large writing tasks into subtasks, manage workflows, or coordinate work that spans multiple writing domains or expertise areas.",
		description: "Coordinate tasks across multiple writing modes",
		groups: [],
		customInstructions:
			"Break down complex writing projects into manageable tasks and delegate them to the most appropriate modes. Use Planner mode for project planning and outlining, Researcher mode for information gathering, Writer mode for content creation, and Ask mode for guidance. Coordinate the workflow to ensure project coherence and quality.",
		i18n: {
			ca: {
				name: "🎯 Orquestrador",
				description: "Coordinar tasques entre múltiples modes d'escriptura",
			},
			de: {
				name: "🎯 Orchestrator",
				description: "Aufgaben über mehrere Schreibmodi koordinieren",
			},
			es: {
				name: "🎯 Orquestador",
				description: "Coordinar tareas entre múltiples modos de escritura",
			},
			fr: {
				name: "🎯 Orchestrateur",
				description: "Coordonner les tâches entre plusieurs modes d'écriture",
			},
			hi: {
				name: "🎯 समन्वयक",
				description: "कई लेखन मोड में कार्यों का समन्वय करना",
			},
			id: {
				name: "🎯 Orkestrator",
				description: "Mengoordinasikan tugas di berbagai mode penulisan",
			},
			it: {
				name: "🎯 Orchestratore",
				description: "Coordinare compiti tra più modalità di scrittura",
			},
			ja: {
				name: "🎯 オーケストレーター",
				description: "複数のライティングモード間でタスクを調整",
			},
			ko: {
				name: "🎯 오케스트레이터",
				description: "여러 작성 모드 간 작업 조정",
			},
			nl: {
				name: "🎯 Orchestrator",
				description: "Taken coördineren tussen meerdere schrijfmodi",
			},
			pl: {
				name: "🎯 Orkiestrator",
				description: "Koordynowanie zadań między wieloma trybami pisania",
			},
			"pt-BR": {
				name: "🎯 Orquestrador",
				description: "Coordenar tarefas entre múltiplos modos de escrita",
			},
			ru: {
				name: "🎯 Оркестратор",
				description: "Координация задач между несколькими режимами письма",
			},
			tr: {
				name: "🎯 Orkestratör",
				description: "Birden fazla yazma modu arasında görevleri koordine etme",
			},
			vi: {
				name: "🎯 Người điều phối",
				description: "Phối hợp các tác vụ giữa nhiều chế độ viết",
			},
			"zh-CN": {
				name: "🎯 协调器",
				description: "跨多个写作模式协调任务",
			},
			"zh-TW": {
				name: "🎯 協調器",
				description: "跨多個寫作模式協調任務",
			},
		},
	},
] as const
