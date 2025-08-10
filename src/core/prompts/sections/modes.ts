import * as path from "path"
import * as vscode from "vscode"
import { promises as fs } from "fs"

import type { ModeConfig } from "@roo-code/types"

import { getAllModesWithLocalization } from "../../../shared/modes"

export async function getModesSection(context: vscode.ExtensionContext, currentLocale?: string): Promise<string> {
	const settingsDir = path.join(context.globalStorageUri.fsPath, "settings")
	await fs.mkdir(settingsDir, { recursive: true })

	// Get all modes with their overrides and localization from extension state
	const allModes = await getAllModesWithLocalization(context, currentLocale)
	// Filter modes by the currently selected mode group (fallback to first default group)
	const selectedModeGroup: string | undefined = context.globalState.get("selectedModeGroup")
	const effectiveGroup = selectedModeGroup ?? DEFAULT_MODE_GROUPS[0]?.id
	const modesForPrompt = effectiveGroup ? allModes.filter((m) => m.modeGroups?.includes(effectiveGroup)) : allModes

	let modesContent = `====

MODES

- These are the currently available modes:
${modesForPrompt
	.map((mode: ModeConfig) => {
		let description: string
		if (mode.whenToUse && mode.whenToUse.trim() !== "") {
			// Use whenToUse as the primary description, indenting subsequent lines for readability
			description = mode.whenToUse.replace(/\n/g, "\n    ")
		} else {
			// Fallback to the first sentence of roleDefinition if whenToUse is not available
			description = mode.roleDefinition.split(".")[0]
		}
		return `  * "${mode.name}" mode (${mode.slug}) - ${description}`
	})
	.join("\n")}`

	modesContent += `
If the user asks you to create or edit a new mode for this project, you should read the instructions by using the fetch_instructions tool, like this:
<fetch_instructions>
<task>create_mode</task>
</fetch_instructions>
`

	return modesContent
}
