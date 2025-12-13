import React, { useEffect } from "react";
import * as d3 from "d3";
import { InterfaceData, NodeData, computeNodes, protocolStyle } from "./useGraph";

interface Props {
  shouldRender: boolean;
  filteredInterfaces: InterfaceData[];
  sourceSystem: string;
  targetSystem: string;
}

const GraphCanvas: React.FC<Props> = ({
  shouldRender,
  filteredInterfaces,
  sourceSystem,
  targetSystem
}) => {

  useEffect(() => {
    if (!shouldRender || filteredInterfaces.length === 0) {
      d3.select("#graph").selectAll("*").remove();
      return;
    }

    const svg = d3.select("#graph");
    svg.selectAll("*").remove();

    const svgWidth = 1200;
    const svgHeight = 800;

    svg
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");

    const scale = Math.min(1, window.innerWidth / 1200);
    const nodeWidth = 120 * scale;
    const nodeHeight = 50 * scale;
    const fontSize = 18 * scale;

    const nodes: NodeData[] = computeNodes(filteredInterfaces, sourceSystem, targetSystem);

    const simulation = d3.forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(0))
      .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .on("tick", ticked);

    const link = svg.append("g")
      .selectAll("line")
      .data(filteredInterfaces)
      .enter()
      .append("line")
      .attr("stroke", (d) => protocolStyle(d.protocol).color)
      .attr("stroke-width", (d) => protocolStyle(d.protocol).width)
      .attr("stroke-dasharray", (d) => protocolStyle(d.protocol).dash);

    const node = svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 12 * scale)
      .attr("ry", 12 * scale)
      .attr("fill", "lightgray")
      .attr("stroke", "#666")
      .attr("x", (d) => d.x - nodeWidth / 2)
      .attr("y", (d) => d.y - nodeHeight / 2);

    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.name)
      .attr("font-size", fontSize)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + fontSize / 3); // ✅ 四角の中央に表示

    function ticked() {
      node
        .attr("x", (d: any) => d.x - nodeWidth / 2)
        .attr("y", (d: any) => d.y - nodeHeight / 2);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y + fontSize / 3);

      link
        .attr("x1", (d: any) => nodes.find((n) => n.id === d.source)?.x || 0)
        .attr("y1", (d: any) => nodes.find((n) => n.id === d.source)?.y || 0)
        .attr("x2", (d: any) => nodes.find((n) => n.id === d.target)?.x || 0)
        .attr("y2", (d: any) => nodes.find((n) => n.id === d.target)?.y || 0);
    }

    return () => {
      simulation.stop();
    };
  }, [shouldRender, filteredInterfaces, sourceSystem, targetSystem]);

  return (
    <div
      translate="no"
      style={{
        width: "100%",
        height: "calc(100vh - 250px)", // ✅ テーブルとコントロールを避ける
        border: "1px solid #ccc",
        marginTop: "16px",
        overflow: "hidden"
      }}
    >
      <svg id="graph" />
    </div>
  );
};

export default GraphCanvas;