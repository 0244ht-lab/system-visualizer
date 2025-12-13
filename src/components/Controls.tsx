import React from "react";

interface ControlsProps {
  sourceSystem: string;
  targetSystem: string;
  protocolFilter: string;
  sourceSystems: string[];
  targetSystems: string[];
  protocolTypes: string[];
  errorMessage: string;
  onSourceChange: (v: string) => void;
  onTargetChange: (v: string) => void;
  onProtocolChange: (v: string) => void;
  onOk: () => void;
  onClear: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  sourceSystem,
  targetSystem,
  protocolFilter,
  sourceSystems,
  targetSystems,
  protocolTypes,
  errorMessage,
  onSourceChange,
  onTargetChange,
  onProtocolChange,
  onOk,
  onClear
}) => {
  const buttonStyle: React.CSSProperties = {
    padding: "6px 16px",
    fontSize: "14px",
    height: "32px"
  };

  return (
    <div translate="no" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <select value={sourceSystem} onChange={(e) => onSourceChange(e.target.value)}>
        <option value="">ソースを選択</option>
        {sourceSystems.map((s) => <option key={s}>{s}</option>)}
      </select>

      <select value={targetSystem} onChange={(e) => onTargetChange(e.target.value)}>
        <option value="">ターゲットを選択</option>
        {targetSystems.map((t) => <option key={t}>{t}</option>)}
      </select>

      <select value={protocolFilter} onChange={(e) => onProtocolChange(e.target.value)}>
        <option value="">プロトコルを選択</option>
        {protocolTypes.map((p) => <option key={p}>{p}</option>)}
      </select>

      <button style={buttonStyle} onClick={onOk}>表示</button>
      <button style={buttonStyle} onClick={onClear}>クリア</button>

      {errorMessage && (
        <div style={{ color: "red", marginLeft: "12px" }}>{errorMessage}</div>
      )}
    </div>
  );
};

export default Controls;