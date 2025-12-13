import React from "react";
import { InterfaceData } from "./useGraph";

interface Props {
  interfaces: InterfaceData[];
}

const InterfaceTable: React.FC<Props> = ({ interfaces }) => {
  return (
    <div translate="no" style={{ marginTop: "16px", maxHeight: "30vh", overflow: "auto" }}>
      <table
        translate="no"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #999"
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #999", padding: "4px" }}>ID</th>
            <th style={{ border: "1px solid #999", padding: "4px" }}>Source</th>
            <th style={{ border: "1px solid #999", padding: "4px" }}>Target</th>
            <th style={{ border: "1px solid #999", padding: "4px" }}>Protocol</th>
            <th style={{ border: "1px solid #999", padding: "4px" }}>Schedule</th>
            <th style={{ border: "1px solid #999", padding: "4px" }}>担当者</th>
          </tr>
        </thead>
        <tbody>
          {interfaces.map((i) => (
            <tr key={i.id}>
              <td style={{ border: "1px solid #999", padding: "4px" }}>{i.id}</td>
              <td style={{ border: "1px solid #999", padding: "4px" }}>{i.source}</td>
              <td style={{ border: "1px solid #999", padding: "4px" }}>{i.target}</td>
              <td style={{ border: "1px solid #999", padding: "4px" }}>{i.protocol}</td>
              <td style={{ border: "1px solid #999", padding: "4px" }}>{i.schedule}</td>
              <td style={{ border: "1px solid #999", padding: "4px" }}>{i.担当者}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InterfaceTable;