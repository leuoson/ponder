import React from "react"
import { Popover, PopoverContent, PopoverTrigger, StandardTooltip } from "@/components/ui"
import { ChevronUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRooPortal } from "@/components/ui/hooks/useRooPortal"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { DEFAULT_MODE_GROUPS, ModeGroup } from "@roo-code/types"
import { applyModeGroupsLocalization } from "@/utils/modeLocalization"

export interface ModeGroupSelectorProps {
	value?: string // group id or undefined for All
	onChange: (groupId?: string) => void
	disabled?: boolean
	title?: string
	triggerClassName?: string
}

export const ModeGroupSelector: React.FC<ModeGroupSelectorProps> = ({
	value,
	onChange,
	disabled = false,
	title = "",
	triggerClassName = "",
}) => {
	const [open, setOpen] = React.useState(false)
	const portalContainer = useRooPortal("roo-portal")
	const { language } = useExtensionState()
	const { t } = useAppTranslation()

	const localizedGroups: ModeGroup[] = React.useMemo(() => {
		const groups = applyModeGroupsLocalization([...DEFAULT_MODE_GROUPS], language || "en")
		return groups.slice().sort((a, b) => a.name.localeCompare(b.name))
	}, [language])

	const allLabel = t("chat:modeGroupSelector.all", { defaultValue: "All Groups" })

	const selectedName = React.useMemo(() => {
		if (!value) return allLabel
		return localizedGroups.find((g) => g.id === value)?.name || allLabel
	}, [value, localizedGroups, allLabel])

	const trigger = (
		<PopoverTrigger
			disabled={disabled}
			className={cn(
				"inline-flex items-center gap-1.5 relative whitespace-nowrap px-1.5 py-1 text-xs",
				"bg-transparent border border-[rgba(255,255,255,0.08)] rounded-md text-vscode-foreground",
				"transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-vscode-focusBorder focus-visible:ring-inset",
				disabled
					? "opacity-50 cursor-not-allowed"
					: "opacity-90 hover:opacity-100 hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)] cursor-pointer",
				triggerClassName,
			)}>
			<ChevronUp className="pointer-events-none opacity-80 flex-shrink-0 size-3" />
			<span className="truncate">{selectedName}</span>
		</PopoverTrigger>
	)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			{title ? <StandardTooltip content={title}>{trigger}</StandardTooltip> : trigger}
			<PopoverContent
				align="start"
				sideOffset={4}
				container={portalContainer}
				className="p-0 overflow-hidden min-w-60">
				<div className="max-h-[300px] overflow-y-auto py-1">
					<div
						onClick={() => {
							onChange(undefined)
							setOpen(false)
						}}
						className={cn(
							"px-3 py-1.5 text-sm cursor-pointer flex items-center hover:bg-vscode-list-hoverBackground",
							!value
								? "bg-vscode-list-activeSelectionBackground text-vscode-list-activeSelectionForeground"
								: "",
						)}>
						<div className="flex-1 min-w-0">
							<div className="font-bold truncate">{allLabel}</div>
						</div>
						{!value && <Check className="ml-auto size-4 p-0.5" />}
					</div>
					{localizedGroups.map((group) => (
						<div
							key={group.id}
							onClick={() => {
								onChange(group.id)
								setOpen(false)
							}}
							className={cn(
								"px-3 py-1.5 text-sm cursor-pointer flex items-center",
								"hover:bg-vscode-list-hoverBackground",
								value === group.id
									? "bg-vscode-list-activeSelectionBackground text-vscode-list-activeSelectionForeground"
									: "",
							)}>
							<div className="flex-1 min-w-0">
								<div className="font-bold truncate">{group.name}</div>
								{group.description && (
									<div className="text-xs text-vscode-descriptionForeground truncate">
										{group.description}
									</div>
								)}
							</div>
							{value === group.id && <Check className="ml-auto size-4 p-0.5" />}
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	)
}

export default ModeGroupSelector
