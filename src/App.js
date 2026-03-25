import React, { useState } from "react";

export default function App() {
  const [dayMaster, setDayMaster] = useState(
    localStorage.getItem("dayMaster") || "wood"
  );
  const [results, setResults] = useState([]);
  const [signal, setSignal] = useState("");
  const [insight, setInsight] = useState("");

  function getWealthDigits(type) {
    if (type === "wood") return ["2", "5", "8"];
    if (type === "fire") return ["6", "7"];
    if (type === "earth") return ["1"];
    if (type === "metal") return ["3", "4"];
    if (type === "water") return ["9"];
    return [];
  }

  function getSupportDigits(type) {
    if (type === "wood") return ["1"];
    if (type === "fire") return ["3", "4"];
    if (type === "earth") return ["9"];
    if (type === "metal") return ["2", "5", "8"];
    if (type === "water") return ["6", "7"];
    return [];
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function analyzePatterns(numbers) {
    const count = {};

    numbers.forEach((n) => {
      n.split("").forEach((d) => {
        count[d] = (count[d] || 0) + 1;
      });
    });

    const values = Object.values(count);
    if (values.length === 0) return 0;

    const max = Math.max(...values);

    if (max >= 12) return 2;
    if (max >= 8) return 1;
    return 0;
  }

  function generate() {
    const wealthDigits = getWealthDigits(dayMaster);
    const supportDigits = getSupportDigits(dayMaster);
    const generated = [];

    function getRandomDigit() {
      return Math.floor(Math.random() * 10).toString();
    }

    function pickSmart() {
      const rand = Math.random();

      if (rand < 0.6) return pick(wealthDigits);
      if (rand < 0.9) return pick(supportDigits);
      return getRandomDigit();
    }

    function scoreNumber(num) {
      let score = 0;

      num.split("").forEach((d) => {
        if (wealthDigits.includes(d)) score++;
      });

      if (score >= 3) return "high";
      if (score === 2) return "medium";
      return "low";
    }

    for (let i = 0; i < 20; i++) {
      const num =
        pickSmart() +
        pickSmart() +
        pickSmart() +
        pickSmart();

      const level = scoreNumber(num);
      generated.push({ num, level });
    }

    const patternScore = analyzePatterns(generated.map((g) => g.num));

    let signalText = "⚠️ SKIP DAY ⚠️";
    if (patternScore >= 2) signalText = "🔥 STRONG PLAY DAY 🔥";
    else if (patternScore === 1) signalText = "⚖️ MODERATE ⚖️";

    const highCount = generated.filter((g) => g.level === "high").length;

    let insightText = "";
    if (signalText.includes("STRONG")) {
      insightText =
        "Favorable alignment detected. Strong pattern clustering and wealth element support indicate higher probability today.";
    } else if (signalText.includes("MODERATE")) {
      insightText =
        "Partial alignment observed. Some wealth signals are present but not dominant. Consider controlled play.";
    } else {
      insightText =
        "Weak pattern structure detected. Low alignment with wealth element. Better to conserve capital today.";
    }

    insightText += ` ${highCount} high probability numbers detected in this batch.`;

    setResults(generated.slice(0, 5));
    setSignal(signalText);
    setInsight(insightText);
  }

  return (
    <div
      style={{
        background: "#0b0b0b",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          margin: "0 auto"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            fontSize: "11px",
            color: "#c9a227",
            letterSpacing: "1.5px",
            marginBottom: "6px"
          }}>
            FORTUNE WEALTH SYSTEM
          </div>

          <h2 style={{
            margin: 0,
            fontSize: "26px"
          }}>
            ✨ Aura Luck ✨
          </h2>

          <div style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#c9c9c9"
          }}>
            Align your timing. Enhance your fortune.
          </div>
        </div>

        <label>Select Day Master:</label>
        <br />

        <select
          value={dayMaster}
          onChange={(e) => {
            setDayMaster(e.target.value);
            localStorage.setItem("dayMaster", e.target.value);
          }}
          style={{
            padding: "12px",
            width: "100%",
            borderRadius: "10px",
            background: "#1a1a1a",
            color: "white",
            border: "1px solid #333",
            marginTop: "10px"
          }}
        >
          <option value="wood">Wood (甲 / 乙)</option>
          <option value="fire">Fire (丙 / 丁)</option>
          <option value="earth">Earth (戊 / 己)</option>
          <option value="metal">Metal (庚 / 辛)</option>
          <option value="water">Water (壬 / 癸)</option>
        </select>

        <button
          onClick={generate}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f3d36b, #c9a227)",
            border: "none",
            fontWeight: "bold",
            color: "#111",
            boxShadow: "0 6px 15px rgba(201,162,39,0.25)",
            cursor: "pointer"
          }}
        >
          Generate Lucky Numbers
        </button>

        <div style={{
          marginTop: "20px",
          padding: "16px",
          borderRadius: "12px",
          textAlign: "center",
          background:
            signal.includes("STRONG") ? "#123d2b" :
            signal.includes("MODERATE") ? "#5a4310" :
            "#4a1f26",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{
            fontSize: "11px",
            opacity: 0.7,
            marginBottom: "6px"
          }}>
            TODAY'S SIGNAL
          </div>

          <div style={{
            fontSize: "20px",
            fontWeight: "bold"
          }}>
            {signal}
          </div>
        </div>

        <p
          style={{
            marginTop: "10px",
            padding: "12px",
            background: "#1a1a1a",
            borderRadius: "10px",
            fontSize: "14px",
            lineHeight: "1.5"
          }}
        >
          {insight || "Generate a batch to see today's insight."}
        </p>

        {results.map((r, i) => (
          <div
            key={i}
            style={{
              marginTop: "12px",
              padding: "16px",
              borderRadius: "14px",
              background:
                r.level === "high"
                  ? "#123d2b"
                  : r.level === "medium"
                  ? "#5a4310"
                  : "#4a1f26",
              display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div>
                <div style={{
                  fontSize: "22px",
                  fontWeight: "bold"
                }}>
                  {r.num}
                </div>

                <div style={{
                  fontSize: "11px",
                  opacity: 0.7,
                  marginTop: "3px"
                }}>
                  Based on element alignment
                </div>
              </div>

              <div style={{
                fontSize: "12px",
                fontWeight: "bold",
                padding: "6px 10px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.1)"
              }}>
                {r.level.toUpperCase()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}