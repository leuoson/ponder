import { describe, it, expect } from "vitest"
import { ModeConfig } from "@roo-code/types"
import { applyModeLocalization, applyModesLocalization, getCurrentLocale, getLocalizedModes } from "../modeLocalization"
import { DEFAULT_MODES } from "@roo-code/types"

// Mock navigator.language
Object.defineProperty(navigator, "language", {
	writable: true,
	value: "en-US",
})

describe("Mode localization utility functions", () => {
	const mockMode: ModeConfig = {
		slug: "planner",
		name: "📋 Planner",
		roleDefinition: "You are Ponder, an experienced content strategist...",
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
		it("should apply localization when i18n data exists", () => {
			const result = applyModeLocalization(mockMode, "zh-CN")

			expect(result.name).toBe("📋 规划师")
			expect(result.description).toBe("写作前的规划和设计")
			expect(result.roleDefinition).toBe(mockMode.roleDefinition) // unchanged
		})

		it("should return original mode when no i18n data exists", () => {
			const result = applyModeLocalization(mockModeWithoutI18n, "zh-CN")

			expect(result).toEqual(mockModeWithoutI18n)
		})

		it("should handle different locales", () => {
			const zhResult = applyModeLocalization(mockMode, "zh-CN")
			const jaResult = applyModeLocalization(mockMode, "ja")

			expect(zhResult.name).toBe("📋 规划师")
			expect(jaResult.name).toBe("📋 プランナー")
		})

		it("should localize all DEFAULT_MODES correctly", () => {
			// Test with actual DEFAULT_MODES from types package (ES import)
			const localizedModes = DEFAULT_MODES.map((mode: any) => applyModeLocalization(mode, "zh-CN"))

			// Check that all modes have Chinese names and descriptions
			expect(localizedModes[0].name).toBe("📋 规划师") // planner
			expect(localizedModes[0].description).toBe("写作前的规划和设计")

			expect(localizedModes[1].name).toBe("✍️ 写作师") // writer
			expect(localizedModes[1].description).toBe("写作、编辑和重构内容")

			expect(localizedModes[2].name).toBe("🔍 研究员") // researcher
			expect(localizedModes[2].description).toBe("研究和收集信息")

			expect(localizedModes[3].name).toBe("❓ 问答助手") // ask
			expect(localizedModes[3].description).toBe("获取写作建议和解释")

			expect(localizedModes[4].name).toBe("🎯 协调器") // orchestrator
			expect(localizedModes[4].description).toBe("跨多个写作模式协调任务")
		})
	})

	describe("applyModesLocalization", () => {
		it("should apply localization to multiple modes", () => {
			const modes = [mockMode, mockModeWithoutI18n]
			const result = applyModesLocalization(modes, "zh-CN")

			expect(result).toHaveLength(2)
			expect(result[0].name).toBe("📋 规划师") // localized
			expect(result[1].name).toBe("Custom Mode") // unchanged
		})

		it("should preserve array order", () => {
			const modes = [mockModeWithoutI18n, mockMode]
			const result = applyModesLocalization(modes, "zh-CN")

			expect(result[0].slug).toBe("custom-mode")
			expect(result[1].slug).toBe("planner")
		})
	})

	describe("getCurrentLocale", () => {
		it("should return the provided i18n language", () => {
			expect(getCurrentLocale("zh-CN")).toBe("zh-CN")
			expect(getCurrentLocale("en")).toBe("en")
			expect(getCurrentLocale("pt-BR")).toBe("pt-BR")
		})
	})

	describe("getLocalizedModes", () => {
		it("should use i18n language to localize modes", () => {
			const modes = [mockMode, mockModeWithoutI18n]
			const result = getLocalizedModes(modes, "zh-CN")

			expect(result[0].name).toBe("📋 规划师") // localized with zh-CN
			expect(result[1].name).toBe("Custom Mode") // unchanged
		})

		it("should handle empty array", () => {
			const result = getLocalizedModes([], "zh-CN")
			expect(result).toEqual([])
		})
	})

	describe("marketplace compatibility", () => {
		it("should work with modes from marketplace", () => {
			// Simulate a mode downloaded from marketplace
			const marketplaceMode: ModeConfig = {
				slug: "marketplace-mode",
				name: "Marketplace Mode",
				roleDefinition: "Downloaded from marketplace",
				groups: ["read"],
				i18n: {
					"zh-CN": {
						name: "市场模式",
						description: "从市场下载的模式",
					},
				},
			}

			const result = applyModeLocalization(marketplaceMode, "zh-CN")

			expect(result.name).toBe("市场模式")
			expect(result.description).toBe("从市场下载的模式")
		})

		it("should handle serialization and deserialization", () => {
			// Test that modes can be serialized/deserialized (important for marketplace)
			const serialized = JSON.stringify(mockMode)
			const deserialized: ModeConfig = JSON.parse(serialized)

			const result = applyModeLocalization(deserialized, "zh-CN")

			expect(result.name).toBe("📋 规划师")
			expect(result.description).toBe("写作前的规划和设计")
		})
	})

	describe("extensibility", () => {
		it("should be easy to extend with new localized fields", () => {
			// This test demonstrates how new fields can be added to the localization system
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
	})
})
