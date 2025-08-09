import React from "react"
import { render, screen, fireEvent } from "@/utils/test-utils"
import { describe, test, expect, vi } from "vitest"
import ModeGroupSelector from "../ModeGroupSelector"

vi.mock("@/components/ui/hooks/useRooPortal", () => ({ useRooPortal: () => document.body }))
vi.mock("@/context/ExtensionStateContext", () => ({ useExtensionState: () => ({ language: "en" }) }))
vi.mock("@/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({ t: (k: string, o?: any) => o?.defaultValue || k }),
}))

describe("ModeGroupSelector", () => {
	test("renders and allows selecting All Groups", () => {
		const onChange = vi.fn()
		render(<ModeGroupSelector value={undefined} onChange={onChange} />)

		// open popover
		fireEvent.click(screen.getByRole("button"))

		// All Groups should be present
		expect(screen.getByText(/All Groups/)).toBeInTheDocument()

		// click All Groups
		fireEvent.click(screen.getByText(/All Groups/))
		expect(onChange).toHaveBeenCalledWith(undefined)
	})
})
