import React, { useState, useEffect } from "react";
import "./LoadingBanner.css";

const LoadingBanner: React.FC = () => {
  const [blocks, setBlocks] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks((prev) => [...prev, prev.length + 1]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-banner">
      <div className="loading-banner-text">トランザクション送信中...</div>
      <div className="blocks-container">
        {blocks.map((_, idx) => (
            <React.Fragment key={idx}>
                <div className="block">
                {idx === 0 ? "Block i" : `Block i+${idx}`}
                </div>
                {idx < blocks.length - 1 && <div className="chain" />}
            </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LoadingBanner;