import { describe, it, expect } from "vitest"
import { ModeConfig } from "@roo-code/types"
import { applyModeLocalization, applyModesLocalization } from "../modes"

describe("Mode localization system", () => {
	const mockMode: ModeConfig = {
		slug: "planner",
		name: "📋 Planner",
		roleDefinition: "You are Ponder, an experienced content strategist...",
		whenToUse: "Use this mode when you need to plan...",
		description: "Plan and design before writing",
		groups: ["read", "edit"],
		i18n: {
			"zh-CN": {
				name: "📋 规划师",
				description: "写作前的规划和设计",
			},
			ja: {
				name: "📋 プランナー",
				description: "執筆前の計画と設計",
			},
		},
	}

	const mockModeWithoutI18n: ModeConfig = {
		slug: "custom-mode",
		name: "Custom Mode",
		roleDefinition: "Custom role definition",
		groups: ["read"],
	}

	describe("applyModeLocalization", () => {
		it("should apply localization when i18n data exists for the locale", () => {
			const result = applyModeLocalization(mockMode, "zh-CN")

			expect(result.name).toBe("📋 规划师")
			expect(result.description).toBe("写作前的规划和设计")
			expect(result.roleDefinition).toBe(mockMode.roleDefinition) // unchanged
			expect(result.whenToUse).toBe(mockMode.whenToUse) // unchanged
		})

		it("should apply different localization for different locales", () => {
			const zhResult = applyModeLocalization(mockMode, "zh-CN")
			const jaResult = applyModeLocalization(mockMode, "ja")

			expect(zhResult.name).toBe("📋 规划师")
			expect(zhResult.description).toBe("写作前的规划和设计")

			expect(jaResult.name).toBe("📋 プランナー")
			expect(jaResult.description).toBe("執筆前の計画と設計")
		})

		it("should return original mode when locale doesn't exist", () => {
			const result = applyModeLocalization(mockMode, "fr-FR")

			expect(result.name).toBe("📋 Planner") // original
			expect(result.description).toBe("Plan and design before writing") // original
		})

		it("should return original mode when no i18n configuration exists", () => {
			const result = applyModeLocalization(mockModeWithoutI18n, "zh-CN")

			expect(result).toEqual(mockModeWithoutI18n)
		})

		it("should handle partial localization data", () => {
			const modeWithPartialI18n: ModeConfig = {
				...mockMode,
				i18n: {
					"zh-CN": {
						name: "📋 规划师",
						// description is missing
					},
				},
			}

			const result = applyModeLocalization(modeWithPartialI18n, "zh-CN")

			expect(result.name).toBe("📋 规划师") // localized
			expect(result.description).toBe("Plan and design before writing") // original fallback
		})

		it("should handle undefined description in original mode", () => {
			const modeWithoutDescription: ModeConfig = {
				...mockMode,
				description: undefined,
			}

			const result = applyModeLocalization(modeWithoutDescription, "zh-CN")

			expect(result.name).toBe("📋 规划师")
			expect(result.description).toBe("写作前的规划和设计")
		})
	})

	describe("applyModesLocalization", () => {
		it("should apply localization to multiple modes", () => {
			const writerMode: ModeConfig = {
				slug: "writer",
				name: "✍️ Writer",
				roleDefinition: "You are a skilled writer...",
				description: "Write, edit, and refactor content",
				groups: ["read", "edit"],
				i18n: {
					"zh-CN": {
						name: "✍️ 写作师",
						description: "写作、编辑和重构内容",
					},
				},
			}

			const modes = [mockMode, writerMode, mockModeWithoutI18n]
			const result = applyModesLocalization(modes, "zh-CN")

			expect(result).toHaveLength(3)

			// Modes with i18n should be localized
			expect(result[0].name).toBe("📋 规划师")
			expect(result[0].description).toBe("写作前的规划和设计")

			expect(result[1].name).toBe("✍️ 写作师")
			expect(result[1].description).toBe("写作、编辑和重构内容")

			// Mode without i18n should remain unchanged
			expect(result[2].name).toBe("Custom Mode")
			expect(result[2].description).toBe(mockModeWithoutI18n.description)
		})

		it("should handle empty array", () => {
			const result = applyModesLocalization([], "zh-CN")
			expect(result).toEqual([])
		})

		it("should preserve array order", () => {
			const modes = [mockModeWithoutI18n, mockMode]
			const result = applyModesLocalization(modes, "zh-CN")

			expect(result[0].slug).toBe("custom-mode")
			expect(result[1].slug).toBe("planner")
		})
	})

	describe("extensibility", () => {
		it("should be easy to extend with new localized fields", () => {
			// This test demonstrates how the system can be extended
			// When new fields are added to ModeI18nData, they should work seamlessly

			const modeWithExtendedI18n: ModeConfig = {
				...mockMode,
				i18n: {
					"zh-CN": {
						name: "📋 规划师",
						description: "写作前的规划和设计",
						// Future fields would be added here:
						// roleDefinition: "你是 Ponder，一位经验丰富的内容策略师...",
						// whenToUse: "当你需要规划、设计或制定策略时使用此模式...",
					},
				},
			}

			const result = applyModeLocalization(modeWithExtendedI18n, "zh-CN")

			expect(result.name).toBe("📋 规划师")
			expect(result.description).toBe("写作前的规划和设计")
			// Future assertions would be added here for new fields
		})

		it("should support marketplace compatibility", () => {
			// This test demonstrates that modes with i18n configuration
			// can be serialized and shared through the marketplace

			const serialized = JSON.stringify(mockMode)
			const deserialized: ModeConfig = JSON.parse(serialized)

			// The deserialized mode should work exactly the same
			const result = applyModeLocalization(deserialized, "zh-CN")

			expect(result.name).toBe("📋 规划师")
			expect(result.description).toBe("写作前的规划和设计")
		})
	})
})
