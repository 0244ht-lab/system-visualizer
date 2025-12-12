import React, { useEffect, useState } from "react";
import * as d3 from "d3";

interface InterfaceData {
  id: string;
  source: string;
  target: string;
  protocol: string;
  担当者: string;
  schedule: string;
}

const protocolStyle = (protocol: string) => {
  switch (protocol) {
    case "FTP": return { color: "blue", width: 2, dash: "4,2", icon: "📂" };
    case "SFTP": return { color: "green", width: 3, dash: null, icon: "🔒" };
    case "HULFT": return { color: "orange", width: 2, dash: "8,4", icon: "📡" };
    case "azcopy": return { color: "purple", width: 4, dash: null, icon: "☁️" };
    case "MQ": return { color: "red", width: 2, dash: "2,2", icon: "📨" };
    case "HTTP": return { color: "brown", width: 2, dash: null, icon: "🌐" };
    default: return { color: "gray", width: 2, dash: null, icon: "❓" };
  }
};

const NetworkGraph: React.FC = () => {
  const [interfaces, setInterfaces] = useState<InterfaceData[]>([]);
  const [sourceSystem, setSourceSystem] = useState<string>("");
  const [targetSystem, setTargetSystem] = useState<string>("");
  const [protocolFilter, setProtocolFilter] = useState<string>("");

  const loadData = async () => {
    try {
      const response = await fetch("/interfaces.json");
      const data: InterfaceData[] = await response.json();
      setInterfaces(data);
    } catch (error) {
      console.error("データ読み込み失敗:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const systemList = Array.from(
    new Set(interfaces.flatMap(iface => [iface.source, iface.target]))
  );

  const protocolList = Array.from(
    new Set(interfaces.map(iface => iface.protocol))
  );

  const filteredInterfaces = interfaces.filter(iface => {
    if (!sourceSystem) return false;

    if (!targetSystem) {
      return (
        iface.source === sourceSystem &&
        (protocolFilter === "" || iface.protocol === protocolFilter)
      );
    }

    return (
      iface.source === sourceSystem &&
      iface.target === targetSystem &&
      (protocolFilter === "" || iface.protocol === protocolFilter)
    );
  });

  useEffect(() => {
    if (filteredInterfaces.length === 0) return;

    const svg = d3.select("#graph");
    svg.selectAll("*").remove();

    // ✅ ターゲット数に応じて SVG の横幅を自動調整
    const targets = Array.from(new Set(filteredInterfaces.map(i => i.target)));
    const svgWidth = Math.max(1200, 400 + targets.length * 250);
    const svgHeight = 800;

    svg.attr("width", svgWidth).attr("height", svgHeight);

    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    let nodes: any[] = [];

    if (!targetSystem) {
      nodes = [
        { id: sourceSystem, name: `System ${sourceSystem}`, x: centerX - 250, y: centerY },
        ...targets.map((t, i) => ({
          id: t,
          name: `System ${t}`,
          x: centerX + 100,
          y: centerY - 200 + i * 80
        }))
      ];
    } else {
      nodes = [
        { id: sourceSystem, name: `System ${sourceSystem}`, x: centerX - 200, y: centerY },
        { id: targetSystem, name: `System ${targetSystem}`, x: centerX + 200, y: centerY }
      ];
    }

    const simulation = d3.forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(0))
      .force("center", d3.forceCenter(centerX, centerY))
      .on("tick", ticked);

    const link = svg.append("g")
      .selectAll("line")
      .data(filteredInterfaces)
      .enter().append("line")
      .attr("stroke", d => protocolStyle(d.protocol).color)
      .attr("stroke-width", d => protocolStyle(d.protocol).width)
      .attr("stroke-dasharray", d => protocolStyle(d.protocol).dash || null);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 30)
      .attr("fill", "lightgray")
      .call(
        (d3.drag() as any)
          .on("start", dragStarted as any)
          .on("drag", dragged as any)
          .on("end", dragEnded as any)
      );

    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.name)
      .attr("font-size", 14)
      .attr("dy", -40);

    function ticked() {
      node.attr("cx", d => (d as any).x).attr("cy", d => (d as any).y);
      label.attr("x", d => (d as any).x).attr("y", d => (d as any).y);

      link
        .attr("x1", d => {
          const src = nodes.find(n => n.id === (d as InterfaceData).source);
          return src ? (src as any).x : 0;
        })
        .attr("y1", d => {
          const src = nodes.find(n => n.id === (d as InterfaceData).source);
          return src ? (src as any).y : 0;
        })
        .attr("x2", d => {
          const tgt = nodes.find(n => n.id === (d as InterfaceData).target);
          return tgt ? (tgt as any).x : 0;
        })
        .attr("y2", d => {
          const tgt = nodes.find(n => n.id === (d as InterfaceData).target);
          return tgt ? (tgt as any).y : 0;
        });
    }

    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [filteredInterfaces, sourceSystem, targetSystem, protocolFilter]);

  return (
    <div>

      {/* ✅ プルダウン */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label>Source: </label>
          <select translate="no" value={sourceSystem} onChange={e => setSourceSystem(e.target.value)}>
            <option value="">--Select--</option>
            {systemList.map(sys => (
              <option key={sys} value={sys}>{sys}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Target: </label>
          <select translate="no" value={targetSystem} onChange={e => setTargetSystem(e.target.value)}>
            <option value="">--Select--</option>
            {systemList.map(sys => (
              <option key={sys} value={sys}>{sys}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Protocol: </label>
          <select translate="no" value={protocolFilter} onChange={e => setProtocolFilter(e.target.value)}>
            <option value="">--All--</option>
            {protocolList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ スクロール可能なグラフ */}
      <div
        style={{
          width: "100%",
          height: "450px",
          overflow: "auto",
          border: "1px solid #ccc",
          marginBottom: "20px"
        }}
      >
        <svg id="graph"></svg>
      </div>

      {/* ✅ テーブル */}
      <div translate="no" style={{ border: "1px solid #ccc", padding: "10px", maxHeight: "300px", overflowY: "scroll" }}>
        <h3>選択した連携IF一覧</h3>

        {filteredInterfaces.length === 0 ? (
          <p style={{ color: "red" }}>選択の連携はありません！</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>ID</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Protocol</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Source</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Target</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Schedule</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>担当者</th>
              </tr>
            </thead>

            <tbody>
              {filteredInterfaces.map(iface => {
                const style = protocolStyle(iface.protocol);
                return (
                  <tr key={iface.id} style={{ color: style.color }}>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{style.icon} {iface.id}</td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{iface.protocol}</td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{iface.source}</td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{iface.target}</td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{iface.schedule}</td>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{iface.担当者}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;