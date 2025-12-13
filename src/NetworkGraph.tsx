import React, { useEffect, useState } from "react";
import Controls from "./components/Controls";
import GraphCanvas from "./components/GraphCanvas";
import InterfaceTable from "./components/InterfaceTable";
import { InterfaceData } from "./components/useGraph";

const NetworkGraph: React.FC = () => {
  const [interfaces, setInterfaces] = useState<InterfaceData[]>([]);
  const [sourceSystem, setSourceSystem] = useState("");
  const [targetSystem, setTargetSystem] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${process.env.PUBLIC_URL}/interfaces.json`);
      const data = await res.json();
      setInterfaces(data);
    };
    load();
  }, []);

  const sourceSystems = Array.from(new Set(interfaces.map((i) => i.source)));
  const targetSystems = Array.from(new Set(interfaces.map((i) => i.target)));
  const protocolTypes = Array.from(new Set(interfaces.map((i) => i.protocol)));

  const handleOk = () => {
    if (!sourceSystem) {
      setErrorMessage("ソースを選択してください");
      setShouldRender(false);
      return;
    }

    if (sourceSystem === targetSystem && targetSystem !== "") {
      setErrorMessage("ソース・ターゲットに同じシステムが選択されてます");
      setShouldRender(false);
      return;
    }

    setErrorMessage("");
    setShouldRender(true);
  };

  const handleClear = () => {
    setShouldRender(false);
  };

  const filteredInterfaces = interfaces.filter((i) => {
    if (!shouldRender) return false;
    if (i.source !== sourceSystem) return false;
    if (targetSystem && i.target !== targetSystem) return false;
    if (protocolFilter && i.protocol !== protocolFilter) return false;
    return true;
  });

  return (
    <div style={{ padding: "16px" }}>
      <Controls
        sourceSystem={sourceSystem}
        targetSystem={targetSystem}
        protocolFilter={protocolFilter}
        sourceSystems={sourceSystems}
        targetSystems={targetSystems}
        protocolTypes={protocolTypes}
        errorMessage={errorMessage}
        onSourceChange={setSourceSystem}
        onTargetChange={setTargetSystem}
        onProtocolChange={setProtocolFilter}
        onOk={handleOk}
        onClear={handleClear}
      />

      <GraphCanvas
        shouldRender={shouldRender}
        filteredInterfaces={filteredInterfaces}
        sourceSystem={sourceSystem}
        targetSystem={targetSystem}
      />

      {shouldRender && <InterfaceTable interfaces={filteredInterfaces} />}
    </div>
  );
};

export default NetworkGraph;