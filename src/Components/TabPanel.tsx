import React from 'react';

interface TabPanelProps {
    index : number;
    children : JSX.Element | JSX.Element[];
    className : string;
}
export default function TabPanel(props : TabPanelProps) {
  const { children, index, className } = props;

  return (
    <div
      role="tabpanel"
      className={`tab-view ${className}`}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      <div className="tabpanel-page">
        {children}
      </div>
    </div>
  );
}