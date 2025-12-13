import * as d3 from "d3";

export interface InterfaceData {
  id: string;
  source: string;
  target: string;
  protocol: string;
  schedule: string;
  担当者: string;
}

export interface NodeData {
  id: string;
  name: string;
  x: number;
  y: number;
}

export const protocolStyle = (protocol: string) => {
  switch (protocol) {
    case "FTP": return { color: "blue", width: 2, dash: "5,3" };
    case "SFTP": return { color: "green", width: 2, dash: "2,2" };
    case "HULFT": return { color: "orange", width: 3, dash: "8,4" };
    case "MQ": return { color: "purple", width: 3, dash: "1,0" };
    case "HTTP": return { color: "red", width: 2, dash: "4,2" };
    case "azcopy": return { color: "teal", width: 2, dash: "6,3" };
    default: return { color: "gray", width: 1, dash: "1,0" };
  }
};

export const computeNodes = (
  filtered: InterfaceData[],
  sourceSystem: string,
  targetSystem: string
): NodeData[] => {
  const targets = Array.from(new Set(filtered.map((i) => i.target)));

  const centerX = 600;
  const centerY = 400;

  if (!targetSystem) {
    return [
      { id: sourceSystem, name: `System ${sourceSystem}`, x: centerX - 250, y: centerY },
      ...targets.map((t, i) => ({
        id: t,
        name: `System ${t}`,
        x: centerX + 100,
        y: centerY - 200 + i * 80
      }))
    ];
  }

  return [
    { id: sourceSystem, name: `System ${sourceSystem}`, x: centerX - 200, y: centerY },
    { id: targetSystem, name: `System ${targetSystem}`, x: centerX + 200, y: centerY }
  ];
};