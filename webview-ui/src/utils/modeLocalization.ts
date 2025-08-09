import { ModeConfig, ModeGroup } from "@roo-code/types"

/**
 * Applies localization to a mode configuration based on current locale
 *
 * This function checks if the mode has i18n configuration for the current locale
 * and applies the localized values, falling back to default values if not available.
 *
 * @param mode - The mode configuration to localize
 * @param currentLocale - The current locale (e.g., 'zh-CN', 'en-US')
 * @returns Mode configuration with localized values applied
 */
export function applyModeLocalization(mode: ModeConfig, currentLocale: string): ModeConfig {
	// If no i18n configuration exists, return the original mode
	if (!mode.i18n || !mode.i18n[currentLocale]) {
		return mode
	}

	const localizedData = mode.i18n[currentLocale]

	return {
		...mode,
		// Apply localized values if they exist, otherwise keep original values
		name: localizedData.name ?? mode.name,
		description: localizedData.description ?? mode.description,
		// Future extensible fields can be added here:
		// roleDefinition: localizedData.roleDefinition ?? mode.roleDefinition,
		// whenToUse: localizedData.whenToUse ?? mode.whenToUse,
		// customInstructions: localizedData.customInstructions ?? mode.customInstructions,
	}
}

/**
 * Applies localization to an array of modes
 *
 * @param modes - Array of mode configurations to localize
 * @param currentLocale - The current locale
 * @returns Array of localized mode configurations
 */
export function applyModesLocalization(modes: ModeConfig[], currentLocale: string): ModeConfig[] {
	return modes.map((mode) => applyModeLocalization(mode, currentLocale))
}

/**
 * Gets the current locale from Ponder's i18n system
 *
 * This function integrates with Ponder's language settings to get the
 * current user's preferred locale.
 *
 * @param i18nLanguage - The language from Ponder's i18n system (required)
 * @returns Current locale string (e.g., 'zh-CN', 'en', 'pt-BR')
 */
export function getCurrentLocale(i18nLanguage: string): string {
	// Ponder already uses full locale codes like 'zh-CN', 'en', 'pt-BR'
	// No conversion needed, just return as-is
	return i18nLanguage
}

/**
 * Convenience function to get localized modes using current locale
 *
 * @param modes - Array of mode configurations to localize
 * @param i18nLanguage - The language from Ponder's i18n system (required)
 * @returns Array of localized mode configurations using current locale
 */
export function getLocalizedModes(modes: ModeConfig[], i18nLanguage: string): ModeConfig[] {
	const currentLocale = getCurrentLocale(i18nLanguage)
	return applyModesLocalization(modes, currentLocale)
}

/**
 * Applies localization to a mode group configuration based on current locale
 */
export function applyModeGroupLocalization(group: ModeGroup, currentLocale: string): ModeGroup {
	if (!group.i18n || !group.i18n[currentLocale]) return group
	const localized = group.i18n[currentLocale]
	return {
		...group,
		name: localized.name ?? group.name,
		description: localized.description ?? group.description,
	}
}

export function applyModeGroupsLocalization(groups: ModeGroup[], currentLocale: string): ModeGroup[] {
	return groups.map((g) => applyModeGroupLocalization(g, currentLocale))
}
