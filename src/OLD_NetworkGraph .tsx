import React, { useEffect, useState } from "react";
import * as d3 from "d3";

// --- 型定義 ---
interface SystemNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  担当者: string;
  fx?: number;
  fy?: number;
}

interface Connection extends d3.SimulationLinkDatum<SystemNode> {
  source: string | SystemNode;
  target: string | SystemNode;
  protocol: string;
  auth: string;
  format: string;
  schedule: string;
  担当者: string;
}

// --- 円形配置関数 ---
const createSystems = (count: number, centerX: number, centerY: number, radius: number): SystemNode[] => {
  const systems: SystemNode[] = [];
  systems.push({ id: "A", name: "System A", 担当者: "田中", fx: centerX, fy: centerY }); // 中央ノード

  for (let i = 1; i < count; i++) {
    const angle = (2 * Math.PI / (count - 1)) * (i - 1);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    systems.push({
      id: String.fromCharCode(65 + i), // A,B,C...T
      name: `System ${String.fromCharCode(65 + i)}`,
      担当者: `担当者${i}`,
      fx: x,
      fy: y
    });
  }
  return systems;
};

// --- データ ---
const centerX = 300;
const centerY = 200;
const radius = 150;

const systems: SystemNode[] = createSystems(20, centerX, centerY, radius);

const connections: Connection[] = [
  { source: "A", target: "B", protocol: "Azcopy", auth: "OAuth2", format: "JSON", schedule: "リアルタイム", 担当者: "田中" },
  { source: "A", target: "C", protocol: "SFTP", auth: "鍵認証", format: "CSV", schedule: "毎日 02:00", 担当者: "佐藤" },
  { source: "A", target: "D", protocol: "HULFT", auth: "Basic認証", format: "XML", schedule: "毎週月曜", 担当者: "鈴木" },
  // 他の接続は必要に応じて追加
];

// --- コンポーネント ---
const NetworkGraph: React.FC = () => {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  useEffect(() => {
    const svg = d3.select("#graph")
      .attr("width", 800)
      .attr("height", 600);

    const simulation = d3.forceSimulation<SystemNode>(systems)
      .force("link", d3.forceLink<SystemNode, Connection>(connections).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(centerX, centerY));

    const link = svg.append("g")
      .selectAll("line")
      .data(connections)
      .enter().append("line")
      .attr("stroke", d => {
        if (d.protocol === "Azcopy") return "blue";
        if (d.protocol === "SFTP") return "green";
        if (d.protocol === "HULFT") return "orange";
        return "gray";
      })
      .attr("stroke-width", 5)
      .on("mouseover", (_, d) => setSelectedConnection(d))
      .on("mouseout", () => setSelectedConnection(null));

    const node = svg.append("g")
      .selectAll("circle")
      .data(systems)
      .enter().append("circle")
      .attr("r", 15)
      .attr("fill", "lightgray");

    const label = svg.append("g")
      .selectAll("text")
      .data(systems)
      .enter().append("text")
      .text(d => d.name)
      .attr("font-size", 10)
      .attr("dy", -20);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as SystemNode).x!)
        .attr("y1", d => (d.source as SystemNode).y!)
        .attr("x2", d => (d.target as SystemNode).x!)
        .attr("y2", d => (d.target as SystemNode).y!);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });
  }, []);

  const renderNodeId = (node: string | SystemNode) =>
    typeof node === "string" ? node : node.id;

  return (
    <div style={{ display: "flex" }}>
      <svg id="graph"></svg>
      <div translate="no" style={{ marginLeft: "20px", width: "250px", border: "1px solid #ccc", padding: "10px" }}>
        <h3>詳細パネル</h3>
        {selectedConnection ? (
          <ul>
            <li><b>Source:</b> {renderNodeId(selectedConnection.source)}</li>
            <li><b>Destination:</b> {renderNodeId(selectedConnection.target)}</li>
            <li><b>Protocol:</b> {selectedConnection.protocol}</li>
            <li><b>Auth:</b> {selectedConnection.auth}</li>
            <li><b>Format:</b> {selectedConnection.format}</li>
            <li><b>Schedule:</b> {selectedConnection.schedule}</li>
            <li><b>担当者:</b> {selectedConnection.担当者}</li>
          </ul>
        ) : (
          <p>接続をホバーすると詳細が表示されます</p>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;