import { minimaxModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer } from "../common/ModelSelector"
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

	// Manage endpoint input mode: preset or custom
	const currentValue = apiConfiguration?.minimaxApiLine || "international"
	const isPreset = currentValue === "international" || currentValue === "china"
	const [inputMode, setInputMode] = useState<"preset" | "custom">(isPreset ? "preset" : "custom")
	const [customValue, setCustomValue] = useState(isPreset ? "" : currentValue)

	// Manage model input mode: preset or custom
	const currentModelId = selectedModelId || ""
	const isPresetModel = currentModelId === "" || currentModelId in minimaxModels
	const [modelInputMode, setModelInputMode] = useState<"preset" | "custom">(isPresetModel ? "preset" : "custom")
	const [customModelValue, setCustomModelValue] = useState(isPresetModel ? "" : currentModelId)

	useEffect(() => {
		const value = apiConfiguration?.minimaxApiLine || "international"
		const preset = value === "international" || value === "china"
		setInputMode(preset ? "preset" : "custom")
		if (!preset) {
			setCustomValue(value)
		}
	}, [apiConfiguration?.minimaxApiLine])

	useEffect(() => {
		const modelId = selectedModelId || ""
		const preset = modelId === "" || modelId in minimaxModels
		setModelInputMode(preset ? "preset" : "custom")
		if (!preset) {
			setCustomModelValue(modelId)
		}
	}, [selectedModelId])

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

	const handleModelPresetChange = (value: string) => {
		if (value === "custom") {
			setModelInputMode("custom")
			// When switching to custom mode, save the current custom value (even if empty)
			// This ensures the mode is properly tracked
			handleModeFieldChange({ plan: "planModeApiModelId", act: "actModeApiModelId" }, customModelValue || "", currentMode)
		} else {
			setModelInputMode("preset")
			handleModeFieldChange({ plan: "planModeApiModelId", act: "actModeApiModelId" }, value, currentMode)
		}
	}

	const handleCustomModelInput = (value: string) => {
		setCustomModelValue(value)
		handleModeFieldChange({ plan: "planModeApiModelId", act: "actModeApiModelId" }, value, currentMode)
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
					<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
						<label htmlFor="minimax-model">
							<span className="font-medium">Model</span>
						</label>
						<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
							<VSCodeDropdown
								id="minimax-model"
								onChange={(e) => handleModelPresetChange((e.target as any).value)}
								style={{
									minWidth: 130,
									position: "relative",
									flex: modelInputMode === "preset" ? 1 : "0 0 auto",
								}}
								value={modelInputMode === "custom" ? "custom" : currentModelId}>
								<VSCodeOption value="">Select a model...</VSCodeOption>
								{Object.keys(minimaxModels).map((modelId) => (
									<VSCodeOption key={modelId} value={modelId}>
										{modelId}
									</VSCodeOption>
								))}
								<VSCodeOption value="custom">自定义模型...</VSCodeOption>
							</VSCodeDropdown>
							{modelInputMode === "custom" && (
								<VSCodeTextField
									onInput={(e) => handleCustomModelInput((e.target as any).value)}
									placeholder="输入自定义模型 ID"
									style={{
										flex: 1,
										minWidth: 200,
									}}
									value={customModelValue}
								/>
							)}
						</div>
					</DropdownContainer>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
