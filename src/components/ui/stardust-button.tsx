"use client";

import React from "react";

type StardustButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

export const StardustButton = ({
  children = "Entra",
  className = "",
  ...props
}: StardustButtonProps) => {
  const beforeAfterStyles = `
    .stardust-button .wrap::before,
    .stardust-button .wrap::after {
      content: "";
      position: absolute;
      transition: all 0.3s ease;
    }

    .stardust-button .wrap::before {
      left: -15%;
      right: -15%;
      bottom: 25%;
      top: -100%;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.16);
    }

    .stardust-button .wrap::after {
      left: 6%;
      right: 6%;
      top: 12%;
      bottom: 40%;
      border-radius: 999px 999px 0 0;
      box-shadow: inset 0 10px 8px -10px rgba(255, 255, 255, 0.9);
      background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.34) 0%,
        rgba(255, 255, 255, 0.12) 44%,
        rgba(0, 0, 0, 0) 100%
      );
    }

    .stardust-button .wrap p span:nth-child(2) {
      display: none;
    }

    .stardust-button:hover .wrap p span:nth-child(1) {
      display: none;
    }

    .stardust-button:hover .wrap p span:nth-child(2) {
      display: inline-block;
    }

    .stardust-button:hover {
      box-shadow:
        inset 0 0.3rem 0.5rem rgba(255, 255, 255, 0.42),
        inset 0 -0.1rem 0.3rem rgba(0, 0, 0, 0.8),
        inset 0 -0.4rem 0.9rem rgba(255, 255, 255, 0.34),
        0 1.4rem 2rem rgba(0, 0, 0, 0.28),
        0 0 1.8rem rgba(255, 255, 255, 0.16);
    }

    .stardust-button:hover .wrap::before {
      transform: translateY(-5%);
    }

    .stardust-button:hover .wrap::after {
      opacity: 0.5;
      transform: translateY(5%);
    }

    .stardust-button:hover .wrap p {
      transform: translateY(-4%);
    }

    .stardust-button:active {
      transform: translateY(4px);
    }
  `;

  return (
    <>
      <style>{beforeAfterStyles}</style>
      <button
        className={`stardust-button ${className}`}
        style={{
          outline: "none",
          cursor: "pointer",
          border: 0,
          position: "relative",
          borderRadius: "999px",
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          transition: "all 0.2s ease",
          boxShadow: `
            inset 0 0.25rem 0.7rem rgba(255, 255, 255, 0.75),
            inset 0 -0.08rem 0.25rem rgba(0, 0, 0, 0.28),
            inset 0 -0.35rem 0.75rem rgba(255, 255, 255, 0.65),
            0 1.2rem 2rem rgba(0, 0, 0, 0.32),
            0 0 1.4rem rgba(255, 255, 255, 0.12)
          `,
        }}
        {...props}
      >
        <div
          className="wrap"
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: "rgba(24, 24, 27, 0.92)",
            padding: "14px 26px",
            borderRadius: "inherit",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: 0,
              transition: "all 0.2s ease",
              transform: "translateY(2%)",
              maskImage: "linear-gradient(to bottom, rgba(255,255,255,1) 42%, transparent)",
            }}
          >
            <span>✧</span>
            <span>✦</span>
            {children}
          </p>
        </div>
      </button>
    </>
  );
};
