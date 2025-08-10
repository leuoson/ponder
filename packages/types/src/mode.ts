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

/**
 * ModeGroup I18n
 */
export const modeGroupI18nDataSchema = z
	.object({
		name: z.string().optional(),
		description: z.string().optional(),
	})
	.strict()

export type ModeGroupI18nData = z.infer<typeof modeGroupI18nDataSchema>

export const modeGroupI18nConfigSchema = z.record(z.string(), modeGroupI18nDataSchema.optional())
export type ModeGroupI18nConfig = z.infer<typeof modeGroupI18nConfigSchema>

/**
 * ModeGroup
 */
export const modeGroupSchema = z.object({
	id: z.string().regex(/^[a-zA-Z0-9-]+$/, "Group id must contain only letters numbers and dashes"),
	name: z.string().min(1, "Group name is required"),
	description: z.string().optional(),
	i18n: modeGroupI18nConfigSchema.optional(),
})

export type ModeGroup = z.infer<typeof modeGroupSchema>

export type ModeI18nConfig = z.infer<typeof modeI18nConfigSchema>

export const modeConfigSchema = z.object({
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),
	name: z.string().min(1, "Name is required"),
	roleDefinition: z.string().min(1, "Role definition is required"),
	whenToUse: z.string().optional(),
	description: z.string().optional(),
	customInstructions: z.string().optional(),
	groups: groupEntryArraySchema,
	modeGroups: z.array(z.string()).optional(),
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
 * DEFAULT_MODE_GROUPS
 */
export const DEFAULT_MODE_GROUPS: readonly ModeGroup[] = [
	{
		id: "literary",
		name: "Literary Creation",
		description: "Creative writing and literary works",
		i18n: {
			ca: { name: "Creació literària", description: "Escriptura creativa i obres literàries" },
			de: { name: "Literarisches Schaffen", description: "Kreatives Schreiben und literarische Werke" },
			es: { name: "Creación literaria", description: "Escritura creativa y obras literarias" },
			fr: { name: "Création littéraire", description: "Écriture créative et œuvres littéraires" },
			hi: { name: "साहित्यिक रचना", description: "रचनात्मक लेखन और साहित्यिक कार्य" },
			id: { name: "Kreasi sastra", description: "Penulisan kreatif dan karya sastra" },
			it: { name: "Creazione letteraria", description: "Scrittura creativa e opere letterarie" },
			ja: { name: "文学創作", description: "創作文芸と文学作品" },
			ko: { name: "문학 창작", description: "창작 문학과 문학 작품" },
			nl: { name: "Literaire creatie", description: "Creatief schrijven en literaire werken" },
			pl: { name: "Twórczość literacka", description: "Pisanie kreatywne i dzieła literackie" },
			"pt-BR": { name: "Criação literária", description: "Escrita criativa e obras literárias" },
			ru: { name: "Литературное творчество", description: "Творческое письмо и литературные произведения" },
			tr: { name: "Edebi yaratım", description: "Yaratıcı yazım ve edebi eserler" },
			vi: { name: "Sáng tác văn học", description: "Viết sáng tạo và tác phẩm văn học" },
			"zh-CN": { name: "文学创作", description: "创意写作与文学作品" },
			"zh-TW": { name: "文學創作", description: "創意寫作與文學作品" },
		},
	},
	{
		id: "marketing",
		name: "Marketing Strategy",
		description: "Marketing planning and promotional content",
		i18n: {
			ca: { name: "Estratègia de màrqueting", description: "Planificació de màrqueting i contingut promocional" },
			de: { name: "Marketing-Strategie", description: "Marketing-Planung und Werbeinhalte" },
			es: { name: "Estrategia de marketing", description: "Planificación de marketing y contenido promocional" },
			fr: { name: "Stratégie marketing", description: "Planification marketing et contenu promotionnel" },
			hi: { name: "मार्केटिंग रणनीति", description: "मार्केटिंग योजना और प्रचार सामग्री" },
			id: { name: "Strategi pemasaran", description: "Perencanaan pemasaran dan konten promosi" },
			it: { name: "Strategia di marketing", description: "Pianificazione marketing e contenuti promozionali" },
			ja: { name: "マーケティング戦略", description: "マーケティング企画とプロモーションコンテンツ" },
			ko: { name: "마케팅 전략", description: "마케팅 기획 및 프로모션 콘텐츠" },
			nl: { name: "Marketingstrategie", description: "Marketingplanning en promotionele inhoud" },
			pl: { name: "Strategia marketingowa", description: "Planowanie marketingowe i treści promocyjne" },
			"pt-BR": {
				name: "Estratégia de marketing",
				description: "Planejamento de marketing e conteúdo promocional",
			},
			ru: { name: "Маркетинговая стратегия", description: "Планирование маркетинга и рекламный контент" },
			tr: { name: "Pazarlama stratejisi", description: "Pazarlama planlaması ve tanıtım içerikleri" },
			vi: { name: "Chiến lược marketing", description: "Lập kế hoạch marketing và nội dung quảng bá" },
			"zh-CN": { name: "营销策划", description: "营销规划与推广内容" },
			"zh-TW": { name: "行銷策劃", description: "行銷規劃與推廣內容" },
		},
	},
	{
		id: "academic",
		name: "Academic Research",
		description: "Research papers and academic writing",
		i18n: {
			ca: { name: "Recerca acadèmica", description: "Articles de recerca i escriptura acadèmica" },
			de: { name: "Akademische Forschung", description: "Forschungsarbeiten und akademisches Schreiben" },
			es: { name: "Investigación académica", description: "Trabajos de investigación y escritura académica" },
			fr: { name: "Recherche académique", description: "Articles de recherche et écriture académique" },
			hi: { name: "शैक्षणिक अनुसंधान", description: "अनुसंधान पत्र और शैक्षणिक लेखन" },
			id: { name: "Penelitian akademik", description: "Makalah penelitian dan penulisan akademik" },
			it: { name: "Ricerca accademica", description: "Articoli di ricerca e scrittura accademica" },
			ja: { name: "学術研究", description: "研究論文および学術執筆" },
			ko: { name: "학술 연구", description: "연구 논문 및 학술 글쓰기" },
			nl: { name: "Academisch onderzoek", description: "Onderzoeksartikelen en academisch schrijven" },
			pl: { name: "Badania akademickie", description: "Prace badawcze i pisanie akademickie" },
			"pt-BR": { name: "Pesquisa acadêmica", description: "Artigos científicos e escrita acadêmica" },
			ru: { name: "Академические исследования", description: "Научные статьи и академическое письмо" },
			tr: { name: "Akademik araştırma", description: "Araştırma makaleleri ve akademik yazım" },
			vi: { name: "Nghiên cứu học thuật", description: "Bài nghiên cứu và viết học thuật" },
			"zh-CN": { name: "学术研究", description: "研究论文与学术写作" },
			"zh-TW": { name: "學術研究", description: "研究論文與學術寫作" },
		},
	},
] as const
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
		slug: "orchestrator",
		name: "🎯 协调器",
		modeGroups: ["literary"],
		roleDefinition:
			"You are Ponder, a strategic workflow orchestrator who coordinates complex creative projects by delegating them to appropriate specialized modes. You have a comprehensive understanding of each mode's capabilities and limitations, allowing you to effectively break down complex creative projects into discrete tasks that can be solved by different specialists.",
		whenToUse:
			"Use this mode for complex, multi-step creative projects that require coordination across different specialties. Ideal when you need to break down large creative tasks into subtasks, manage workflows, or coordinate work that spans multiple creative domains or expertise areas.",
		description: "Coordinate tasks across multiple creative modes",
		groups: [],
		customInstructions:
			"Break down complex creative projects into manageable tasks and delegate them to the most appropriate modes. Use Planner mode for project planning and outlining, Researcher mode for information gathering, Writer mode for content creation, and Ask mode for guidance. Coordinate the workflow to ensure project coherence and quality.",
		i18n: {
			ca: {
				name: "🎯 Coordinador",
				description: "Coordinar tasques entre múltiples modes creatius",
			},
			de: {
				name: "🎯 Koordinator",
				description: "Aufgaben über mehrere kreative Modi koordinieren",
			},
			es: {
				name: "🎯 Coordinador",
				description: "Coordinar tareas entre múltiples modos creativos",
			},
			fr: {
				name: "🎯 Coordinateur",
				description: "Coordonner les tâches entre plusieurs modes créatifs",
			},
			hi: {
				name: "🎯 समन्वयक",
				description: "कई रचनात्मक मोड में कार्यों का समन्वय करना",
			},
			id: {
				name: "🎯 Koordinator",
				description: "Mengoordinasikan tugas di berbagai mode kreatif",
			},
			it: {
				name: "🎯 Coordinatore",
				description: "Coordinare compiti tra più modalità creative",
			},
			ja: {
				name: "🎯 コーディネーター",
				description: "複数のクリエイティブモード間でタスクを調整",
			},
			ko: {
				name: "🎯 코디네이터",
				description: "여러 창작 모드 간 작업 조정",
			},
			nl: {
				name: "🎯 Coördinator",
				description: "Taken coördineren tussen meerdere creatieve modi",
			},
			pl: {
				name: "🎯 Koordynator",
				description: "Koordynowanie zadań między wieloma trybami twórczymi",
			},
			"pt-BR": {
				name: "🎯 Coordenador",
				description: "Coordenar tarefas entre múltiplos modos criativos",
			},
			ru: {
				name: "🎯 Координатор",
				description: "Координация задач между несколькими творческими режимами",
			},
			tr: {
				name: "🎯 Koordinatör",
				description: "Birden fazla yaratıcı mod arasında görevleri koordine etme",
			},
			vi: {
				name: "🎯 Điều phối viên",
				description: "Phối hợp các tác vụ giữa nhiều chế độ sáng tạo",
			},
			"zh-CN": {
				name: "🎯 协调器",
				description: "跨多个创作模式协调任务",
			},
			"zh-TW": {
				name: "🎯 協調器",
				description: "跨多個創作模式協調任務",
			},
		},
	},
	{
		slug: "planner",
		name: "📋 创作规划",
		modeGroups: ["literary"],
		roleDefinition:
			"You are Ponder, an experienced content strategist who is inquisitive and an excellent planner. Your goal is to gather information and get context to create a detailed plan for accomplishing the user's creative task, which the user will review and approve before they switch into another mode to implement the solution.",
		whenToUse:
			"Use this mode for comprehensive planning and strategic guidance throughout your creative process. Perfect for initial project planning, mid-process restructuring, content optimization, strategic pivots, and post-creation analysis. Whether you're starting fresh, stuck in the middle, or refining completed work.",
		description: "Strategic planning and guidance throughout the creative process",
		groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
		customInstructions:
			'1. Do some information gathering (using provided tools) to get more context about the creative task.\n\n2. You should also ask the user clarifying questions to get a better understanding of the task.\n\n3. Once you\'ve gained more context about the user\'s request, break down the task into clear, actionable steps and create a todo list using the `update_todo_list` tool. Each todo item should be:\n   - Specific and actionable\n   - Listed in logical execution order\n   - Focused on a single, well-defined outcome\n   - Clear enough that another mode could execute it independently\n\n   **Note:** If the `update_todo_list` tool is not available, write the plan to a markdown file (e.g., `plan.md` or `todo.md`) instead.\n\n4. As you gather more information or discover new requirements, update the todo list to reflect the current understanding of what needs to be accomplished.\n\n5. Ask the user if they are pleased with this plan, or if they would like to make any changes. Think of this as a brainstorming session where you can discuss the task and refine the todo list.\n\n6. Include Mermaid diagrams if they help clarify complex workflows or content structure. When generating Mermaid, follow these rules:\n   - Use newline \\n for line breaks; do not use HTML tags like <br> or <br/>.\n   - Keep node IDs ASCII (e.g., A, B1); put non-ASCII text (e.g., Chinese) inside double quotes as the label.\n   - Use ASCII brackets to specify shapes: (\\"...\\"), [\\"...\\"], {\\"...\\"}.\n   - Avoid HTML and inline styles; stick to plain Mermaid syntax.\n\n7. Use the switch_mode tool to request that the user switch to another mode to implement the solution.\n\n8. After the plan is approved, materialize the final plan as a dedicated folder structure without modifying any existing body content. Create a top-level planning folder (e.g., `planning/` or `plans/<date>-<title>/`) that mirrors phases/tasks and includes new files such as:\n   - `README.md` (executive summary and navigation of the plan)\n   - `plan.md` (approved plan and the todo list)\n   - `context.md` (assumptions, requirements, constraints)\n   - `references.md` (links and sources)\n   - `notes/` (additional relevant information as separate markdown files)\nOnly create new files inside this planning folder; do not edit or overwrite any existing user documents or content.\n\n**IMPORTANT: Focus on creating clear, actionable todo lists rather than lengthy markdown documents. Use the todo list as your primary planning tool to track and organize the work that needs to be done.**',
		i18n: {
			ca: {
				name: "📋 Planificació creativa",
				description: "Planificació estratègica i orientació durant tot el procés creatiu",
			},
			de: {
				name: "📋 Kreative Planung",
				description: "Strategische Planung und Führung während des gesamten kreativen Prozesses",
			},
			es: {
				name: "📋 Planificación creativa",
				description: "Planificación estratégica y orientación durante todo el proceso creativo",
			},
			fr: {
				name: "📋 Planification créative",
				description: "Planification stratégique et guidance tout au long du processus créatif",
			},
			hi: {
				name: "📋 रचनात्मक योजना",
				description: "पूरी रचनात्मक प्रक्रिया के दौरान रणनीतिक योजना और मार्गदर्शन",
			},
			id: {
				name: "📋 Perencanaan Kreatif",
				description: "Perencanaan strategis dan panduan sepanjang proses kreatif",
			},
			it: {
				name: "📋 Pianificazione creativa",
				description: "Pianificazione strategica e guida durante tutto il processo creativo",
			},
			ja: {
				name: "📋 創作企画",
				description: "創作プロセス全体を通じた戦略的計画とガイダンス",
			},
			ko: {
				name: "📋 창작 기획",
				description: "전체 창작 과정에서의 전략적 계획 및 가이드",
			},
			nl: {
				name: "📋 Creatieve Planning",
				description: "Strategische planning en begeleiding gedurende het hele creatieve proces",
			},
			pl: {
				name: "📋 Planowanie kreatywne",
				description: "Strategiczne planowanie i przewodnictwo przez cały proces twórczy",
			},
			"pt-BR": {
				name: "📋 Planejamento criativo",
				description: "Planejamento estratégico e orientação durante todo o processo criativo",
			},
			ru: {
				name: "📋 Творческое планирование",
				description: "Стратегическое планирование и руководство на протяжении всего творческого процесса",
			},
			tr: {
				name: "📋 Yaratıcı planlama",
				description: "Tüm yaratıcı süreç boyunca stratejik planlama ve rehberlik",
			},
			vi: {
				name: "📋 Lập kế hoạch sáng tạo",
				description: "Lập kế hoạch chiến lược và hướng dẫn trong suốt quá trình sáng tạo",
			},
			"zh-CN": {
				name: "📋 创作规划",
				description: "贯穿整个创作过程的战略规划和指导",
			},
			"zh-TW": {
				name: "📋 創作規劃",
				description: "貫穿整個創作過程的戰略規劃和指導",
			},
		},
	},
	{
		slug: "writer",
		name: "✍️ Content Creation",
		modeGroups: ["literary"],
		roleDefinition:
			"You are Ponder, a highly skilled creator with extensive knowledge in many creative styles, genres, formats, and best practices. You excel at both creating new content and improving existing text.",
		whenToUse:
			"Use this mode when you need to create, modify, edit, or refactor content. Ideal for creating new articles, improving existing text, fixing creative issues, or making content improvements across any creative format or style.",
		description: "Create, edit, and refactor content",
		groups: ["read", "edit", "browser", "command", "mcp"],
		customInstructions:
			"1. For new content: Focus on creating clear, engaging, and well-structured content that matches the intended audience and purpose.\n2. For existing content: Review systematically for grammar, clarity, flow, and effectiveness while preserving the author's voice.\n3. Maintain consistent voice, tone, and style throughout the content.\n4. Pay attention to readability, logical organization, and impact.\n5. Use appropriate formatting and structure for the content type.\n6. Incorporate research and sources naturally when needed.\n7. Provide specific, actionable suggestions for improvement when editing.\n8. Adapt creative style to match project requirements and target audience.",
		i18n: {
			ca: {
				name: "✍️ Creació de contingut",
				description: "Escriu, edita i refactoritza contingut",
			},
			de: {
				name: "✍️ Content-Erstellung",
				description: "Schreiben, bearbeiten und überarbeiten von Inhalten",
			},
			es: {
				name: "✍️ Creación de contenido",
				description: "Escribir, editar y refactorizar contenido",
			},
			fr: {
				name: "✍️ Création de contenu",
				description: "Écrire, éditer et refactoriser le contenu",
			},
			hi: {
				name: "✍️ सामग्री निर्माण",
				description: "सामग्री लिखना, संपादित करना और पुनर्गठन करना",
			},
			id: {
				name: "✍️ Pembuatan Konten",
				description: "Menulis, mengedit, dan merestrukturisasi konten",
			},
			it: {
				name: "✍️ Creazione contenuti",
				description: "Scrivere, modificare e ristrutturare contenuti",
			},
			ja: {
				name: "✍️ コンテンツ作成",
				description: "コンテンツの執筆、編集、リファクタリング",
			},
			ko: {
				name: "✍️ 콘텐츠 제작",
				description: "콘텐츠 작성, 편집 및 리팩토링",
			},
			nl: {
				name: "✍️ Content creatie",
				description: "Schrijven, bewerken en herstructureren van content",
			},
			pl: {
				name: "✍️ Tworzenie treści",
				description: "Pisanie, edytowanie i refaktoryzacja treści",
			},
			"pt-BR": {
				name: "✍️ Criação de conteúdo",
				description: "Escrever, editar e refatorar conteúdo",
			},
			ru: {
				name: "✍️ Создание контента",
				description: "Написание, редактирование и рефакторинг контента",
			},
			tr: {
				name: "✍️ İçerik oluşturma",
				description: "İçerik yazma, düzenleme ve yeniden yapılandırma",
			},
			vi: {
				name: "✍️ Tạo nội dung",
				description: "Viết, chỉnh sửa và tái cấu trúc nội dung",
			},
			"zh-CN": {
				name: "✍️ 内容创作",
				description: "写作、编辑和重构内容",
			},
			"zh-TW": {
				name: "✍️ 內容創作",
				description: "寫作、編輯和重構內容",
			},
		},
	},
	{
		slug: "researcher",
		name: "🔍 Research & Information",
		modeGroups: ["literary"],
		roleDefinition:
			"You are Ponder, a thorough researcher skilled at finding, evaluating, and synthesizing information from various sources to support creative projects.",
		whenToUse:
			"Use this mode when you need to research topics, gather information, verify facts, or find sources for your creative work. Perfect for academic content, journalism, or any content requiring factual accuracy and credible sources.",
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
				name: "🔍 Recerca i informació",
				description: "Investigar i recopilar informació",
			},
			de: {
				name: "🔍 Recherche & Information",
				description: "Recherchieren und Informationen sammeln",
			},
			es: {
				name: "🔍 Investigación e información",
				description: "Investigar y recopilar información",
			},
			fr: {
				name: "🔍 Recherche et information",
				description: "Rechercher et rassembler des informations",
			},
			hi: {
				name: "🔍 अनुसंधान और जानकारी",
				description: "अनुसंधान और जानकारी एकत्र करना",
			},
			id: {
				name: "🔍 Riset & Informasi",
				description: "Meneliti dan mengumpulkan informasi",
			},
			it: {
				name: "🔍 Ricerca e informazioni",
				description: "Ricercare e raccogliere informazioni",
			},
			ja: {
				name: "🔍 調査・情報収集",
				description: "調査と情報収集",
			},
			ko: {
				name: "🔍 연구 및 정보",
				description: "연구 및 정보 수집",
			},
			nl: {
				name: "🔍 Onderzoek & Informatie",
				description: "Onderzoeken en informatie verzamelen",
			},
			pl: {
				name: "🔍 Badania i informacje",
				description: "Badanie i zbieranie informacji",
			},
			"pt-BR": {
				name: "🔍 Pesquisa e informação",
				description: "Pesquisar e coletar informações",
			},
			ru: {
				name: "🔍 Исследования и информация",
				description: "Исследование и сбор информации",
			},
			tr: {
				name: "🔍 Araştırma ve bilgi",
				description: "Araştırma yapma ve bilgi toplama",
			},
			vi: {
				name: "🔍 Nghiên cứu & thông tin",
				description: "Nghiên cứu và thu thập thông tin",
			},
			"zh-CN": {
				name: "🔍 研究信息",
				description: "研究和收集信息",
			},
			"zh-TW": {
				name: "🔍 研究資訊",
				description: "研究和收集資訊",
			},
		},
	},
	{
		slug: "ask",
		name: "❓ Creative Guidance",
		modeGroups: ["literary"],
		roleDefinition:
			"You are Ponder, a knowledgeable creative assistant focused on answering questions and providing information about creative techniques, grammar, style, publishing, and related topics.",
		whenToUse:
			"Use this mode when you need explanations, guidance, or answers to creative-related questions. Best for understanding creative concepts, analyzing existing content, getting recommendations, or learning about creative techniques without making changes.",
		description: "Get creative advice and explanations",
		groups: ["read", "browser", "mcp"],
		customInstructions:
			"You can analyze content, explain writing concepts, and access external resources. Always answer the user's questions thoroughly, and do not switch to implementing changes unless explicitly requested by the user. Include diagrams when they clarify your response.",
		i18n: {
			ca: {
				name: "❓ Orientació creativa",
				description: "Obtenir consells creatius i explicacions",
			},
			de: {
				name: "❓ Kreative Beratung",
				description: "Kreative Beratung und Erklärungen erhalten",
			},
			es: {
				name: "❓ Orientación creativa",
				description: "Obtener consejos creativos y explicaciones",
			},
			fr: {
				name: "❓ Guidance créative",
				description: "Obtenir des conseils créatifs et des explications",
			},
			hi: {
				name: "❓ रचनात्मक मार्गदर्शन",
				description: "रचनात्मक सलाह और स्पष्टीकरण प्राप्त करें",
			},
			id: {
				name: "❓ Panduan Kreatif",
				description: "Mendapatkan saran kreatif dan penjelasan",
			},
			it: {
				name: "❓ Guida creativa",
				description: "Ottenere consigli creativi e spiegazioni",
			},
			ja: {
				name: "❓ クリエイティブガイダンス",
				description: "クリエイティブなアドバイスと説明を取得",
			},
			ko: {
				name: "❓ 창작 가이드",
				description: "창작 조언과 설명 얻기",
			},
			nl: {
				name: "❓ Creatieve begeleiding",
				description: "Creatief advies en uitleg krijgen",
			},
			pl: {
				name: "❓ Przewodnik kreatywny",
				description: "Uzyskiwanie porad dotyczących twórczości i wyjaśnień",
			},
			"pt-BR": {
				name: "❓ Orientação criativa",
				description: "Obter conselhos criativos e explicações",
			},
			ru: {
				name: "❓ Творческое руководство",
				description: "Получение творческих советов и объяснений",
			},
			tr: {
				name: "❓ Yaratıcı rehberlik",
				description: "Yaratıcı tavsiyeler ve açıklamalar alma",
			},
			vi: {
				name: "❓ Hướng dẫn sáng tạo",
				description: "Nhận lời khuyên sáng tạo và giải thích",
			},
			"zh-CN": {
				name: "❓ 创作指导",
				description: "获取创作建议和解释",
			},
			"zh-TW": {
				name: "❓ 創作指導",
				description: "獲取創作建議和解釋",
			},
		},
	},
	// Marketing Strategy Modes
	{
		slug: "marketing-orchestrator",
		name: "🎯 协调器",
		modeGroups: ["marketing"],
		groups: ["read", "edit", "modes"],
		roleDefinition: `You are Ponder, a marketing orchestration specialist focused on coordinating complex marketing projects, managing integrated campaigns, ensuring consistent brand messaging, and optimizing workflows by leveraging specialized marketing expertise for cohesive business results.`,
		whenToUse:
			"Use this mode for complex, multi-step marketing projects that require coordination across different marketing specialties. Ideal when you need to break down large marketing campaigns into subtasks, manage workflows, or coordinate work that spans multiple marketing domains or expertise areas.",
		description: "Coordinate tasks across multiple marketing modes",
		customInstructions:
			"Break down complex marketing projects into manageable tasks and delegate them to the most appropriate marketing modes. Use Brand Copywriting mode for content creation, Marketing Strategy mode for strategic planning, and Market Analysis mode for research. Coordinate the workflow to ensure campaign coherence, brand consistency, and optimal results.",
		i18n: {
			ca: {
				name: "🎯 Coordinador",
				description: "Coordinar projectes de màrqueting complexos i campanyes integrades",
			},
			de: {
				name: "🎯 Koordinator",
				description: "Komplexe Marketing-Projekte und integrierte Kampagnen koordinieren",
			},
			es: {
				name: "🎯 Coordinador",
				description: "Coordinar proyectos de marketing complejos y campañas integradas",
			},
			fr: {
				name: "🎯 Coordinateur",
				description: "Coordonner des projets marketing complexes et des campagnes intégrées",
			},
			hi: { name: "🎯 समन्वयक", description: "जटिल मार्केटिंग परियोजनाओं और एकीकृत अभियानों का समन्वय" },
			id: {
				name: "🎯 Koordinator",
				description: "Mengoordinasikan proyek pemasaran kompleks dan kampanye terintegrasi",
			},
			it: {
				name: "🎯 Coordinatore",
				description: "Coordinare progetti di marketing complessi e campagne integrate",
			},
			ja: {
				name: "🎯 コーディネーター",
				description: "複雑なマーケティングプロジェクトと統合キャンペーンの調整",
			},
			ko: { name: "🎯 코디네이터", description: "복잡한 마케팅 프로젝트와 통합 캠페인 조정" },
			nl: {
				name: "🎯 Coördinator",
				description: "Complexe marketingprojecten en geïntegreerde campagnes coördineren",
			},
			pl: {
				name: "🎯 Koordynator",
				description: "Koordynowanie złożonych projektów marketingowych i zintegrowanych kampanii",
			},
			"pt-BR": {
				name: "🎯 Coordenador",
				description: "Coordenar projetos de marketing complexos e campanhas integradas",
			},
			ru: {
				name: "🎯 Координатор",
				description: "Координация сложных маркетинговых проектов и интегрированных кампаний",
			},
			tr: {
				name: "🎯 Koordinatör",
				description: "Karmaşık pazarlama projelerini ve entegre kampanyaları koordine etme",
			},
			vi: {
				name: "🎯 Điều phối viên",
				description: "Điều phối các dự án marketing phức tạp và chiến dịch tích hợp",
			},
			"zh-CN": { name: "🎯 协调器", description: "协调复杂的营销项目和整合营销活动" },
			"zh-TW": { name: "🎯 協調器", description: "協調複雜的行銷專案和整合行銷活動" },
		},
	},
	{
		slug: "brand-copywriter",
		name: "✍️ Brand Copywriting",
		modeGroups: ["marketing"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, a brand copywriting specialist focused on crafting compelling brand stories, developing brand voice guidelines, creating persuasive marketing copy, and designing engaging content that drives conversions through emotional connections and clear calls-to-action.`,
		whenToUse:
			"Use this mode when you need to create compelling brand content, marketing copy, or brand messaging. Perfect for writing website copy, marketing materials, brand stories, social media content, email campaigns, or any content that needs to reflect brand voice and drive engagement.",
		description: "Create compelling brand content and marketing copy",
		customInstructions:
			"1. Understand the brand voice, tone, and target audience before writing.\n2. Focus on creating emotional connections while maintaining clear messaging.\n3. Include strong calls-to-action that drive desired user behavior.\n4. Ensure consistency with brand guidelines and messaging strategy.\n5. Write for conversion while maintaining authenticity and brand personality.\n6. Adapt writing style to different marketing channels and formats.\n7. Use persuasive writing techniques that resonate with the target audience.\n8. Test and iterate on messaging for maximum impact.",
		i18n: {
			ca: {
				name: "✍️ Redacció de marca",
				description: "Crear contingut de marca persuasiu i històries convincents",
			},
			de: {
				name: "✍️ Marken-Texterstellung",
				description: "Überzeugende Markeninhalte und Geschichten erstellen",
			},
			es: {
				name: "✍️ Redacción de marca",
				description: "Crear contenido de marca persuasivo e historias convincentes",
			},
			fr: {
				name: "✍️ Rédaction de marque",
				description: "Créer du contenu de marque persuasif et des histoires convaincantes",
			},
			hi: { name: "✍️ ब्रांड कॉपीराइटिंग", description: "प्रेरक ब्रांड सामग्री और आकर्षक कहानियां बनाना" },
			id: {
				name: "✍️ Penulisan Konten Merek",
				description: "Membuat konten merek yang persuasif dan cerita yang menarik",
			},
			it: {
				name: "✍️ Copywriting di brand",
				description: "Creare contenuti di marca persuasivi e storie coinvolgenti",
			},
			ja: {
				name: "✍️ ブランドコピーライティング",
				description: "説得力のあるブランドコンテンツと魅力的なストーリーの作成",
			},
			ko: { name: "✍️ 브랜드 카피라이팅", description: "설득력 있는 브랜드 콘텐츠와 매력적인 스토리 제작" },
			nl: { name: "✍️ Merk copywriting", description: "Overtuigende merkinhoud en boeiende verhalen creëren" },
			pl: {
				name: "✍️ Copywriting marki",
				description: "Tworzenie przekonujących treści marki i angażujących historii",
			},
			"pt-BR": {
				name: "✍️ Redação de marca",
				description: "Criar conteúdo de marca persuasivo e histórias envolventes",
			},
			ru: {
				name: "✍️ Бренд-копирайтинг",
				description: "Создание убедительного брендового контента и захватывающих историй",
			},
			tr: {
				name: "✍️ Marka metin yazarlığı",
				description: "İkna edici marka içeriği ve etkileyici hikayeler oluşturma",
			},
			vi: {
				name: "✍️ Copywriting thương hiệu",
				description: "Tạo nội dung thương hiệu thuyết phục và câu chuyện hấp dẫn",
			},
			"zh-CN": { name: "✍️ 品牌文案", description: "创作有说服力的品牌内容和引人入胜的故事" },
			"zh-TW": { name: "✍️ 品牌文案", description: "創作有說服力的品牌內容和引人入勝的故事" },
		},
	},
	{
		slug: "marketing-strategist",
		name: "📈 Marketing Strategy",
		modeGroups: ["marketing"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, a marketing strategy specialist focused on developing comprehensive marketing strategies, analyzing market opportunities, creating customer journey maps, and optimizing marketing ROI through data-driven approaches and actionable implementation roadmaps.`,
		whenToUse:
			"Use this mode when you need to develop comprehensive marketing strategies, create strategic plans, or optimize marketing performance. Perfect for strategic planning, ROI analysis, customer journey mapping, marketing mix optimization, or creating data-driven marketing roadmaps.",
		description: "Develop comprehensive marketing strategies and optimize ROI",
		customInstructions:
			"1. Conduct thorough market analysis and competitive research before strategy development.\n2. Define clear marketing objectives aligned with business goals.\n3. Develop customer personas and journey maps to guide strategy.\n4. Create data-driven marketing mix strategies (4Ps: Product, Price, Place, Promotion).\n5. Establish KPIs and measurement frameworks for tracking success.\n6. Design implementation roadmaps with clear timelines and milestones.\n7. Consider budget allocation and resource optimization.\n8. Include contingency plans and strategy adaptation mechanisms.",
		i18n: {
			ca: {
				name: "📈 Estratègia de màrqueting",
				description: "Desenvolupar estratègies de màrqueting integrals i optimitzar el ROI",
			},
			de: {
				name: "📈 Marketing-Strategie",
				description: "Umfassende Marketing-Strategien entwickeln und ROI optimieren",
			},
			es: {
				name: "📈 Estrategia de marketing",
				description: "Desarrollar estrategias de marketing integrales y optimizar el ROI",
			},
			fr: {
				name: "📈 Stratégie marketing",
				description: "Développer des stratégies marketing complètes et optimiser le ROI",
			},
			hi: {
				name: "📈 मार्केटिंग रणनीति",
				description: "व्यापक मार्केटिंग रणनीति विकसित करना और ROI अनुकूलित करना",
			},
			id: {
				name: "📈 Strategi Pemasaran",
				description: "Mengembangkan strategi pemasaran komprehensif dan mengoptimalkan ROI",
			},
			it: {
				name: "📈 Strategia di marketing",
				description: "Sviluppare strategie di marketing complete e ottimizzare il ROI",
			},
			ja: { name: "📈 マーケティング戦略", description: "包括的なマーケティング戦略の策定とROI最適化" },
			ko: { name: "📈 마케팅 전략", description: "포괄적인 마케팅 전략 개발 및 ROI 최적화" },
			nl: {
				name: "📈 Marketing strategie",
				description: "Uitgebreide marketingstrategieën ontwikkelen en ROI optimaliseren",
			},
			pl: {
				name: "📈 Strategia marketingowa",
				description: "Opracowywanie kompleksowych strategii marketingowych i optymalizacja ROI",
			},
			"pt-BR": {
				name: "📈 Estratégia de marketing",
				description: "Desenvolver estratégias de marketing abrangentes e otimizar ROI",
			},
			ru: {
				name: "📈 Маркетинговая стратегия",
				description: "Разработка комплексных маркетинговых стратегий и оптимизация ROI",
			},
			tr: {
				name: "📈 Pazarlama stratejisi",
				description: "Kapsamlı pazarlama stratejileri geliştirme ve ROI optimizasyonu",
			},
			vi: {
				name: "📈 Chiến lược marketing",
				description: "Phát triển chiến lược marketing toàn diện và tối ưu hóa ROI",
			},
			"zh-CN": { name: "📈 营销策略", description: "制定综合营销策略并优化投资回报率" },
			"zh-TW": { name: "📈 行銷策略", description: "制定綜合行銷策略並優化投資報酬率" },
		},
	},
	{
		slug: "market-analyst",
		name: "📊 Market Analysis",
		modeGroups: ["marketing"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, a market analysis specialist focused on conducting comprehensive market research, performing competitive analysis, analyzing consumer behavior trends, and generating actionable insights through statistical analysis and strategic frameworks like SWOT and Porter's Five Forces.`,
		whenToUse:
			"Use this mode when you need to conduct market research, competitive analysis, or consumer behavior studies. Perfect for analyzing market trends, evaluating competitors, understanding target audiences, conducting SWOT analysis, or generating market insights for strategic decision-making.",
		description: "Conduct comprehensive market research and competitive analysis",
		customInstructions:
			"1. Define clear research objectives and methodology before starting analysis.\n2. Gather data from multiple reliable sources including primary and secondary research.\n3. Use established frameworks like SWOT, Porter's Five Forces, and PEST analysis.\n4. Analyze competitor strategies, strengths, weaknesses, and market positioning.\n5. Study consumer behavior patterns, preferences, and decision-making factors.\n6. Identify market trends, opportunities, and potential threats.\n7. Present findings with clear visualizations and actionable recommendations.\n8. Ensure data accuracy and cite all sources properly.",
		i18n: {
			ca: {
				name: "📊 Anàlisi de mercat",
				description: "Realitzar investigació de mercat i anàlisi competitiva exhaustiva",
			},
			de: {
				name: "📊 Marktanalyse",
				description: "Umfassende Marktforschung und Wettbewerbsanalyse durchführen",
			},
			es: {
				name: "📊 Análisis de mercado",
				description: "Realizar investigación de mercado y análisis competitivo integral",
			},
			fr: {
				name: "📊 Analyse de marché",
				description: "Effectuer des études de marché et analyses concurrentielles approfondies",
			},
			hi: { name: "📊 बाजार विश्लेषण", description: "व्यापक बाजार अनुसंधान और प्रतिस्पर्धी विश्लेषण करना" },
			id: {
				name: "📊 Analisis Pasar",
				description: "Melakukan riset pasar dan analisis kompetitif yang komprehensif",
			},
			it: {
				name: "📊 Analisi di mercato",
				description: "Condurre ricerche di mercato e analisi competitive approfondite",
			},
			ja: { name: "📊 市場分析", description: "包括的な市場調査と競合分析の実施" },
			ko: { name: "📊 시장 분석", description: "포괄적인 시장 조사 및 경쟁 분석 수행" },
			nl: { name: "📊 Marktanalyse", description: "Uitgebreid marktonderzoek en concurrentieanalyse uitvoeren" },
			pl: {
				name: "📊 Analiza rynku",
				description: "Przeprowadzanie kompleksowych badań rynku i analiz konkurencyjnych",
			},
			"pt-BR": {
				name: "📊 Análise de mercado",
				description: "Realizar pesquisa de mercado e análise competitiva abrangente",
			},
			ru: {
				name: "📊 Рыночный анализ",
				description: "Проведение комплексных исследований рынка и конкурентного анализа",
			},
			tr: { name: "📊 Pazar analizi", description: "Kapsamlı pazar araştırması ve rekabet analizi yapma" },
			vi: {
				name: "📊 Phân tích thị trường",
				description: "Thực hiện nghiên cứu thị trường và phân tích cạnh tranh toàn diện",
			},
			"zh-CN": { name: "📊 市场分析", description: "进行全面的市场研究和竞争分析" },
			"zh-TW": { name: "📊 市場分析", description: "進行全面的市場研究和競爭分析" },
		},
	},
	// Academic Research Modes
	{
		slug: "academic-orchestrator",
		name: "🎯 协调器",
		modeGroups: ["academic"],
		groups: ["read", "edit", "modes"],
		roleDefinition: `You are Ponder, an academic orchestration specialist focused on managing comprehensive research projects, coordinating between academic disciplines, ensuring research integrity, optimizing workflows, and facilitating collaboration for rigorous scholarly outcomes from conception to publication.`,
		whenToUse:
			"Use this mode for complex, multi-step academic research projects that require coordination across different academic specialties. Ideal when you need to break down large research projects into subtasks, manage academic workflows, or coordinate work that spans multiple disciplines or research methodologies.",
		description: "Coordinate tasks across multiple academic research modes",
		customInstructions:
			"Break down complex academic research projects into manageable tasks and delegate them to the most appropriate academic modes. Use Academic Research mode for research methodology and data collection, Academic Writing mode for paper structure and writing, Literature Analysis mode for systematic reviews, Research Data Analysis mode for statistical analysis, and other specialized modes as needed. Coordinate the workflow to ensure research integrity, methodological rigor, and scholarly quality throughout the project lifecycle.",
		i18n: {
			ca: {
				name: "🎯 Coordinador",
				description: "Gestionar projectes de recerca integrals i coordinar disciplines acadèmiques",
			},
			de: {
				name: "🎯 Koordinator",
				description: "Umfassende Forschungsprojekte verwalten und akademische Disziplinen koordinieren",
			},
			es: {
				name: "🎯 Coordinador",
				description: "Gestionar proyectos de investigación integrales y coordinar disciplinas académicas",
			},
			fr: {
				name: "🎯 Coordinateur",
				description: "Gérer des projets de recherche complets et coordonner les disciplines académiques",
			},
			hi: {
				name: "🎯 समन्वयक",
				description: "व्यापक अनुसंधान परियोजनाओं का प्रबंधन और शैक्षणिक विषयों का समन्वय",
			},
			id: {
				name: "🎯 Koordinator",
				description: "Mengelola proyek penelitian komprehensif dan mengoordinasikan disiplin akademik",
			},
			it: {
				name: "🎯 Coordinatore",
				description: "Gestire progetti di ricerca completi e coordinare discipline accademiche",
			},
			ja: { name: "🎯 コーディネーター", description: "包括的な研究プロジェクトの管理と学術分野の調整" },
			ko: { name: "🎯 코디네이터", description: "포괄적인 연구 프로젝트 관리 및 학술 분야 조정" },
			nl: {
				name: "🎯 Coördinator",
				description: "Uitgebreide onderzoeksprojecten beheren en academische disciplines coördineren",
			},
			pl: {
				name: "🎯 Koordynator",
				description: "Zarządzanie kompleksowymi projektami badawczymi i koordynowanie dyscyplin akademickich",
			},
			"pt-BR": {
				name: "🎯 Coordenador",
				description: "Gerenciar projetos de pesquisa abrangentes e coordenar disciplinas acadêmicas",
			},
			ru: {
				name: "🎯 Координатор",
				description:
					"Управление комплексными исследовательскими проектами и координация академических дисциплин",
			},
			tr: {
				name: "🎯 Koordinatör",
				description: "Kapsamlı araştırma projelerini yönetme ve akademik disiplinleri koordine etme",
			},
			vi: {
				name: "🎯 Điều phối viên",
				description: "Quản lý các dự án nghiên cứu toàn diện và điều phối các ngành học thuật",
			},
			"zh-CN": { name: "🎯 协调器", description: "管理综合研究项目并协调学术学科" },
			"zh-TW": { name: "🎯 協調器", description: "管理綜合研究專案並協調學術學科" },
		},
	},
	{
		slug: "academic-writer",
		name: "✍️ Academic Writing",
		modeGroups: ["academic"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, an academic writing specialist focused on crafting well-structured scholarly papers, ensuring proper academic formatting, developing clear arguments, organizing content logically, and adhering to academic writing conventions with appropriate tone, style, and citation practices.`,
		whenToUse:
			"Use this mode when you need to write academic papers, structure scholarly arguments, or format academic documents. Perfect for writing research papers, dissertations, thesis chapters, conference papers, journal articles, or any academic writing that requires proper structure, formatting, and scholarly tone.",
		description: "Write and structure academic papers with proper formatting",
		customInstructions:
			"1. Structure papers with clear academic sections (Abstract, Introduction, Literature Review, Methodology, Results, Discussion, Conclusion).\n2. Develop logical arguments with proper evidence and citations.\n3. Use appropriate academic tone and formal language.\n4. Follow specific formatting guidelines (APA, MLA, Chicago, etc.) as required.\n5. Create clear transitions between sections and paragraphs.\n6. Ensure proper academic writing conventions and style.\n7. Organize content hierarchically with appropriate headings and subheadings.\n8. Maintain consistency in terminology and argumentation throughout the paper.",
		i18n: {
			ca: {
				name: "✍️ Escriptura acadèmica",
				description: "Redactar i estructurar articles acadèmics amb format adequat",
			},
			de: {
				name: "✍️ Akademisches Schreiben",
				description: "Akademische Arbeiten schreiben und strukturieren mit angemessener Formatierung",
			},
			es: {
				name: "✍️ Escritura académica",
				description: "Redactar y estructurar artículos académicos con formato adecuado",
			},
			fr: {
				name: "✍️ Rédaction académique",
				description: "Rédiger et structurer des articles académiques avec un formatage approprié",
			},
			hi: { name: "✍️ शैक्षणिक लेखन", description: "उचित स्वरूपण के साथ शैक्षणिक पत्र लिखना और संरचित करना" },
			id: {
				name: "✍️ Penulisan Akademik",
				description: "Menulis dan menyusun makalah akademik dengan format yang tepat",
			},
			it: {
				name: "✍️ Scrittura accademica",
				description: "Scrivere e strutturare articoli accademici con formattazione appropriata",
			},
			ja: { name: "✍️ 学術ライティング", description: "適切なフォーマットで学術論文の執筆と構造化" },
			ko: { name: "✍️ 학술 작문", description: "적절한 형식으로 학술 논문 작성 및 구조화" },
			nl: {
				name: "✍️ Academisch schrijven",
				description: "Academische artikelen schrijven en structureren met juiste opmaak",
			},
			pl: {
				name: "✍️ Pisanie akademickie",
				description: "Pisanie i strukturyzowanie artykułów akademickich z odpowiednim formatowaniem",
			},
			"pt-BR": {
				name: "✍️ Escrita acadêmica",
				description: "Escrever e estruturar artigos acadêmicos com formatação adequada",
			},
			ru: {
				name: "✍️ Академическое письмо",
				description: "Написание и структурирование академических статей с правильным форматированием",
			},
			tr: {
				name: "✍️ Akademik yazım",
				description: "Uygun biçimlendirme ile akademik makaleler yazma ve yapılandırma",
			},
			vi: {
				name: "✍️ Viết học thuật",
				description: "Viết và cấu trúc các bài báo học thuật với định dạng phù hợp",
			},
			"zh-CN": { name: "✍️ 学术写作", description: "撰写和构建格式规范的学术论文" },
			"zh-TW": { name: "✍️ 學術寫作", description: "撰寫和構建格式規範的學術論文" },
		},
	},
	{
		slug: "academic-researcher",
		name: "🔍 Academic Research",
		modeGroups: ["academic"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, an academic research specialist focused on conducting rigorous scholarly research, developing research questions, designing research methodologies, collecting and organizing data, and ensuring research integrity with adherence to ethical guidelines and academic standards.`,
		whenToUse:
			"Use this mode when you need to conduct scholarly research, design research methodologies, or develop research frameworks. Perfect for developing research questions, designing research proposals, conducting systematic literature reviews, collecting research data, or any scholarly work requiring rigorous research methodology and ethical compliance.",
		description: "Conduct rigorous scholarly research and design methodologies",
		customInstructions:
			"1. Follow rigorous academic methodology and research standards.\n2. Develop clear, focused research questions and hypotheses.\n3. Design appropriate research methodologies for different types of studies.\n4. Conduct comprehensive literature reviews using credible academic sources.\n5. Ensure ethical compliance in research practices and data collection.\n6. Organize and document research data systematically.\n7. Maintain objectivity and avoid bias in research design and data collection.\n8. Validate research approaches and ensure methodological rigor.",
		i18n: {
			ca: {
				name: "🔍 Investigació acadèmica",
				description: "Realitzar investigació acadèmica rigorosa i dissenyar metodologies",
			},
			de: {
				name: "🔍 Akademische Forschung",
				description: "Rigorose akademische Forschung durchführen und Methodologien entwerfen",
			},
			es: {
				name: "🔍 Investigación académica",
				description: "Realizar investigación académica rigurosa y diseñar metodologías",
			},
			fr: {
				name: "🔍 Recherche académique",
				description: "Mener des recherches académiques rigoureuses et concevoir des méthodologies",
			},
			hi: { name: "🔍 शैक्षणिक अनुसंधान", description: "कठोर शैक्षणिक अनुसंधान करना और पद्धति डिजाइन करना" },
			id: {
				name: "🔍 Penelitian Akademik",
				description: "Melakukan penelitian akademik yang ketat dan merancang metodologi",
			},
			it: {
				name: "🔍 Ricerca accademica",
				description: "Condurre ricerca accademica rigorosa e progettare metodologie",
			},
			ja: { name: "🔍 学術研究", description: "厳密な学術研究の実施と方法論の設計" },
			ko: { name: "🔍 학술 연구", description: "엄격한 학술 연구 수행 및 방법론 설계" },
			nl: {
				name: "🔍 Academisch onderzoek",
				description: "Rigoureus academisch onderzoek uitvoeren en methodologieën ontwerpen",
			},
			pl: {
				name: "🔍 Badania akademickie",
				description: "Prowadzenie rygorystycznych badań akademickich i projektowanie metodologii",
			},
			"pt-BR": {
				name: "🔍 Pesquisa acadêmica",
				description: "Realizar pesquisa acadêmica rigorosa e projetar metodologias",
			},
			ru: {
				name: "🔍 Академические исследования",
				description: "Проведение строгих академических исследований и разработка методологий",
			},
			tr: {
				name: "🔍 Akademik araştırma",
				description: "Titiz akademik araştırma yapma ve metodoloji tasarlama",
			},
			vi: {
				name: "🔍 Nghiên cứu học thuật",
				description: "Thực hiện nghiên cứu học thuật nghiêm ngặt và thiết kế phương pháp luận",
			},
			"zh-CN": { name: "🔍 学术研究", description: "进行严谨的学术研究并设计研究方法" },
			"zh-TW": { name: "🔍 學術研究", description: "進行嚴謹的學術研究並設計研究方法" },
		},
	},
	{
		slug: "literature-analyst",
		name: "📚 Literature Analysis",
		modeGroups: ["academic"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, a literature analysis specialist focused on conducting systematic literature reviews, performing critical analysis of scholarly sources, identifying research gaps, synthesizing findings across disciplines, and creating comprehensive bibliographies with proper academic citations.`,
		i18n: {
			ca: {
				name: "📚 Anàlisi de literatura",
				description: "Realitzar revisions sistemàtiques de literatura i anàlisi crítica de fonts",
			},
			de: {
				name: "📚 Literaturanalyse",
				description: "Systematische Literaturrecherchen und kritische Quellenanalyse durchführen",
			},
			es: {
				name: "📚 Análisis de literatura",
				description: "Realizar revisiones sistemáticas de literatura y análisis crítico de fuentes",
			},
			fr: {
				name: "📚 Analyse de littérature",
				description: "Effectuer des revues systématiques de littérature et analyses critiques des sources",
			},
			hi: {
				name: "📚 साहित्य विश्लेषण",
				description: "व्यवस्थित साहित्य समीक्षा और स्रोतों का आलोचनात्मक विश्लेषण करना",
			},
			id: {
				name: "📚 Analisis Literatur",
				description: "Melakukan tinjauan literatur sistematis dan analisis kritis sumber",
			},
			it: {
				name: "📚 Analisi di letteratura",
				description: "Condurre revisioni sistematiche della letteratura e analisi critiche delle fonti",
			},
			ja: { name: "📚 文献分析", description: "系統的文献レビューと情報源の批判的分析の実施" },
			ko: { name: "📚 문헌 분석", description: "체계적 문헌 검토 및 자료의 비판적 분석 수행" },
			nl: {
				name: "📚 Literatuuranalyse",
				description: "Systematische literatuuronderzoeken en kritische bronanalyse uitvoeren",
			},
			pl: {
				name: "📚 Analiza literatury",
				description: "Przeprowadzanie systematycznych przeglądów literatury i krytycznej analizy źródeł",
			},
			"pt-BR": {
				name: "📚 Análise de literatura",
				description: "Realizar revisões sistemáticas de literatura e análise crítica de fontes",
			},
			ru: {
				name: "📚 Литературный анализ",
				description: "Проведение систематических обзоров литературы и критического анализа источников",
			},
			tr: {
				name: "📚 Literatür analizi",
				description: "Sistematik literatür taraması ve kaynakların eleştirel analizi yapma",
			},
			vi: {
				name: "📚 Phân tích tài liệu",
				description: "Thực hiện đánh giá tài liệu có hệ thống và phân tích phê bình nguồn",
			},
			"zh-CN": { name: "📚 文献分析", description: "进行系统性文献综述和批判性资料分析" },
			"zh-TW": { name: "📚 文獻分析", description: "進行系統性文獻綜述和批判性資料分析" },
		},
	},
	{
		slug: "research-data-analyst",
		name: "📈 Research Data Analysis",
		modeGroups: ["academic"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, a research data analysis specialist focused on designing statistical analysis plans, performing quantitative and qualitative data analysis, interpreting results, creating visualizations, and ensuring methodological rigor with tools like R, SPSS, and Python.`,
		whenToUse:
			"Use this mode when you need to analyze research data, perform statistical analysis, or interpret quantitative/qualitative results. Perfect for designing analysis plans, conducting statistical tests, creating data visualizations, interpreting research findings, or ensuring methodological rigor in data analysis.",
		description: "Design statistical analysis plans and interpret research results",
		customInstructions:
			"1. Design appropriate statistical analysis plans based on research questions and data types.\n2. Choose suitable statistical methods for quantitative and qualitative data analysis.\n3. Ensure data quality and address missing data appropriately.\n4. Perform rigorous statistical tests and validate assumptions.\n5. Create clear, informative data visualizations and charts.\n6. Interpret results objectively and discuss limitations.\n7. Use appropriate statistical software and tools (R, SPSS, Python, etc.).\n8. Document analysis procedures for reproducibility and transparency.",
		i18n: {
			ca: {
				name: "📈 Anàlisi de dades de recerca",
				description: "Dissenyar plans d'anàlisi estadística i interpretar resultats de recerca",
			},
			de: {
				name: "📈 Forschungsdatenanalyse",
				description: "Statistische Analysepläne entwerfen und Forschungsergebnisse interpretieren",
			},
			es: {
				name: "📈 Análisis de datos de investigación",
				description: "Diseñar planes de análisis estadístico e interpretar resultados de investigación",
			},
			fr: {
				name: "📈 Analyse de données de recherche",
				description: "Concevoir des plans d'analyse statistique et interpréter les résultats de recherche",
			},
			hi: {
				name: "📈 अनुसंधान डेटा विश्लेषण",
				description: "सांख्यिकीय विश्लेषण योजना डिजाइन करना और अनुसंधान परिणामों की व्याख्या करना",
			},
			id: {
				name: "📈 Analisis Data Penelitian",
				description: "Merancang rencana analisis statistik dan menginterpretasi hasil penelitian",
			},
			it: {
				name: "📈 Analisi di dati di ricerca",
				description: "Progettare piani di analisi statistica e interpretare risultati di ricerca",
			},
			ja: { name: "📈 研究データ分析", description: "統計分析計画の設計と研究結果の解釈" },
			ko: { name: "📈 연구 데이터 분석", description: "통계 분석 계획 설계 및 연구 결과 해석" },
			nl: {
				name: "📈 Onderzoeksdataanalyse",
				description: "Statistische analyseplannen ontwerpen en onderzoeksresultaten interpreteren",
			},
			pl: {
				name: "📈 Analiza danych badawczych",
				description: "Projektowanie planów analizy statystycznej i interpretacja wyników badań",
			},
			"pt-BR": {
				name: "📈 Análise de dados de pesquisa",
				description: "Projetar planos de análise estatística e interpretar resultados de pesquisa",
			},
			ru: {
				name: "📈 Анализ исследовательских данных",
				description: "Разработка планов статистического анализа и интерпретация результатов исследований",
			},
			tr: {
				name: "📈 Araştırma veri analizi",
				description: "İstatistiksel analiz planları tasarlama ve araştırma sonuçlarını yorumlama",
			},
			vi: {
				name: "📈 Phân tích dữ liệu nghiên cứu",
				description: "Thiết kế kế hoạch phân tích thống kê và giải thích kết quả nghiên cứu",
			},
			"zh-CN": { name: "📈 研究数据分析", description: "设计统计分析计划并解释研究结果" },
			"zh-TW": { name: "📈 研究數據分析", description: "設計統計分析計劃並解釋研究結果" },
		},
	},
	{
		slug: "academic-translator",
		name: "🌐 Academic Translation",
		modeGroups: ["academic"],
		groups: ["read", "edit"],
		roleDefinition: `You are Ponder, an academic translation specialist focused on multilingual scholarly content translation, ensuring accuracy of technical terminology, maintaining academic tone, facilitating cross-language academic communication, and using English as an intermediate language when needed for optimal translation quality between any language pairs.`,
		whenToUse:
			"Use this mode when you need to translate academic content between any languages, especially when dealing with complex terminology or when direct translation quality is insufficient. Perfect for translating research papers, academic documents, technical terms, or when you need to understand content in unfamiliar languages.",
		description: "Translate academic content between languages with terminological accuracy",
		customInstructions:
			"1. For optimal translation quality, use English as an intermediate language when translating between non-English language pairs.\n2. Maintain accuracy of technical and academic terminology throughout translation.\n3. Preserve the academic tone and formal register of the original content.\n4. Research and verify specialized terminology in the target academic field.\n5. Provide context or explanations for terms that don't have direct equivalents.\n6. Maintain proper citation formats and academic conventions in the target language.\n7. When uncertain about terminology, provide multiple translation options with explanations.\n8. Ensure cultural and academic context appropriateness for the target audience.",
		i18n: {
			ca: {
				name: "🌐 Traducció acadèmica",
				description: "Traduir contingut acadèmic entre idiomes amb precisió terminològica i to acadèmic",
			},
			de: {
				name: "🌐 Akademische Übersetzung",
				description: "Akademische Inhalte zwischen Sprachen mit terminologischer Genauigkeit übersetzen",
			},
			es: {
				name: "🌐 Traducción académica",
				description: "Traducir contenido académico entre idiomas con precisión terminológica y tono académico",
			},
			fr: {
				name: "🌐 Traduction académique",
				description:
					"Traduire du contenu académique entre langues avec précision terminologique et ton académique",
			},
			hi: {
				name: "🌐 शैक्षणिक अनुवाद",
				description: "शब्दावली की सटीकता और शैक्षणिक स्वर के साथ भाषाओं के बीच शैक्षणिक सामग्री का अनुवाद",
			},
			id: {
				name: "🌐 Terjemahan Akademik",
				description: "Menerjemahkan konten akademik antar bahasa dengan akurasi terminologi dan nada akademik",
			},
			it: {
				name: "🌐 Traduzione accademica",
				description: "Tradurre contenuti accademici tra lingue con precisione terminologica e tono accademico",
			},
			ja: {
				name: "🌐 学術翻訳",
				description: "専門用語の正確性と学術的トーンを保持した言語間の学術コンテンツ翻訳",
			},
			ko: {
				name: "🌐 학술 번역",
				description: "전문 용어의 정확성과 학술적 어조를 유지한 언어 간 학술 콘텐츠 번역",
			},
			nl: {
				name: "🌐 Academische vertaling",
				description:
					"Academische inhoud tussen talen vertalen met terminologische nauwkeurigheid en academische toon",
			},
			pl: {
				name: "🌐 Tłumaczenie akademickie",
				description:
					"Tłumaczenie treści akademickich między językami z dokładnością terminologiczną i tonem akademickim",
			},
			"pt-BR": {
				name: "🌐 Tradução acadêmica",
				description: "Traduzir conteúdo acadêmico entre idiomas com precisão terminológica e tom acadêmico",
			},
			ru: {
				name: "🌐 Академический перевод",
				description:
					"Перевод академического контента между языками с терминологической точностью и академическим тоном",
			},
			tr: {
				name: "🌐 Akademik çeviri",
				description: "Terminolojik doğruluk ve akademik tonla diller arası akademik içerik çevirisi",
			},
			vi: {
				name: "🌐 Dịch thuật học thuật",
				description:
					"Dịch nội dung học thuật giữa các ngôn ngữ với độ chính xác thuật ngữ và giọng điệu học thuật",
			},
			"zh-CN": { name: "🌐 学术翻译", description: "在语言间翻译学术内容，确保术语准确性和学术语调" },
			"zh-TW": { name: "🌐 學術翻譯", description: "在語言間翻譯學術內容，確保術語準確性和學術語調" },
		},
	},
] as const
