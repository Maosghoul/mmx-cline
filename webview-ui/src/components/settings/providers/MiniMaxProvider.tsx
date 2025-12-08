import { minimaxModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer, ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the MinimaxProvider component
 */
interface MinimaxProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Minimax AI Studio provider configuration component
 */
export const MinimaxProvider = ({ showModelOptions, isPopup, currentMode }: MinimaxProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Manage input mode: preset or custom
	const currentValue = apiConfiguration?.minimaxApiLine || "international"
	const isPreset = currentValue === "international" || currentValue === "china"
	const [inputMode, setInputMode] = useState<"preset" | "custom">(isPreset ? "preset" : "custom")
	const [customValue, setCustomValue] = useState(isPreset ? "" : currentValue)

	useEffect(() => {
		const value = apiConfiguration?.minimaxApiLine || "international"
		const preset = value === "international" || value === "china"
		setInputMode(preset ? "preset" : "custom")
		if (!preset) {
			setCustomValue(value)
		}
	}, [apiConfiguration?.minimaxApiLine])

	const handlePresetChange = (value: string) => {
		if (value === "custom") {
			setInputMode("custom")
			if (customValue) {
				handleFieldChange("minimaxApiLine", customValue)
			}
		} else {
			setInputMode("preset")
			handleFieldChange("minimaxApiLine", value)
		}
	}

	const handleCustomInput = (value: string) => {
		setCustomValue(value)
		handleFieldChange("minimaxApiLine", value)
	}

	return (
		<div>
			<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
				<label htmlFor="minimax-entrypoint">
					<span style={{ fontWeight: 500, marginTop: 5 }}>MiniMax Entrypoint</span>
				</label>
				<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
					<VSCodeDropdown
						id="minimax-entrypoint"
						onChange={(e) => handlePresetChange((e.target as any).value)}
						style={{
							minWidth: 130,
							position: "relative",
							flex: inputMode === "preset" ? 1 : "0 0 auto",
						}}
						value={inputMode === "custom" ? "custom" : currentValue}>
						<VSCodeOption value="international">api.minimax.io</VSCodeOption>
						<VSCodeOption value="china">api.minimaxi.com</VSCodeOption>
						<VSCodeOption value="custom">自定义...</VSCodeOption>
					</VSCodeDropdown>
					{inputMode === "custom" && (
						<VSCodeTextField
							onInput={(e) => handleCustomInput((e.target as any).value)}
							placeholder="输入自定义 API endpoint"
							style={{
								flex: 1,
								minWidth: 200,
							}}
							value={customValue}
						/>
					)}
				</div>
			</DropdownContainer>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				Select the API endpoint according to your region: <code>api.minimaxi.com</code> for China, or{" "}
				<code>api.minimax.io</code> for all other locations. You can also enter a custom endpoint.
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.minimaxApiKey || ""}
				onChange={(value) => handleFieldChange("minimaxApiKey", value)}
				providerName="MiniMax"
				signupUrl={
					apiConfiguration?.minimaxApiLine === "china"
						? "https://platform.minimaxi.com/user-center/basic-information/interface-key"
						: "https://www.minimax.io/platform/user-center/basic-information/interface-key"
				}
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label="Model"
						models={minimaxModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
