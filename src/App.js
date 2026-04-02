import { useState, useEffect } from "react";
import { Solar } from "lunar-javascript";

export default function App() {
  const todayKey = new Date().toISOString().split("T")[0];
  const [dayMaster, setDayMaster] = useState(
    localStorage.getItem("dayMaster") || "wood"
  );
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState("manual");
  const [signal, setSignal] = useState("");
  const [insight, setInsight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [city, setCity] = useState("");
  const [sex, setSex] = useState("M");
  const [calculatedResult, setCalculatedResult] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPro, setIsPro] = useState(
    localStorage.getItem("isPro") === "true");
  const [usageCount, setUsageCount] = useState(() => {
    const savedDate = localStorage.getItem("usageDate");
    const savedCount = Number(localStorage.getItem("usageCount")) || 0;
          if (savedDate !== todayKey) {
            localStorage.setItem("usageDate", todayKey);
            localStorage.setItem("usageCount", "0");
            return 0;
          }

          return savedCount;
        });
  const [showPricing, setShowPricing] = useState(false);
  const [auraScore, setAuraScore] = useState(null);
  const [luckyHours, setLuckyHours] = useState([]);
  const [todayElement, setTodayElement] = useState("");
  const [dayRelation, setDayRelation] = useState("");

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
    const realTodayElement = getChineseDayElement();
    const relation = getDayRelation(dayMaster, realTodayElement);

    if (!isPro && usageCount === 2) {
      setInsight("You're on your last free use. Consider upgrading to PRO.");
    }

    if (!isPro && usageCount >= 3) {
      setInsight("Free limit reached. Upgrade to PRO for unlimited access.");
      setShowPricing(true); // 🔥 AUTO TRIGGER
      return;
    }

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
      const rating = getNumberRating(
        num,
        level,
        wealthDigits,
        supportDigits,
        relation,
        realTodayElement
      );

      generated.push({ num, level, rating });
    }

    generated.sort((a, b) => b.rating - a.rating);

    const patternScore = analyzePatterns(generated.map((g) => g.num));
    const alignmentValue = patternScore * 20 + relation.bonus;

    let signalText = "🌑 WEAK ALIGNMENT DAY 🌑";

    if (relation.type === "pressure") {
      if (patternScore >= 2) {
        signalText = "⚖️ STABLE FLOW DAY ⚖️";
      } else {
        signalText = "🌑 WEAK ALIGNMENT DAY 🌑";
      }
    } else if (alignmentValue >= 50) {
      signalText = "🔥 PEAK ALIGNMENT DAY 🔥";
    } else if (alignmentValue >= 20) {
      signalText = "⚖️ STABLE FLOW DAY ⚖️";
    }

    let baseScore;

    if (signalText.includes("PEAK")) {
      baseScore = Math.floor(Math.random() * 15) + 70;
    } else if (signalText.includes("STABLE")) {
      baseScore = Math.floor(Math.random() * 20) + 50;
    } else {
      baseScore = Math.floor(Math.random() * 20) + 25;
    }

    let score = baseScore + relation.bonus;

    if (score > 99) score = 99;
    if (score < 20) score = 20;

    let hours = [];

    if (signalText.includes("PEAK")) {
      hours = ["09:00 – 11:00", "13:00 – 15:00", "19:00 – 21:00"];
    } else if (signalText.includes("STABLE")) {
      hours = ["11:00 – 13:00", "17:00 – 19:00"];
    } else {
      hours = ["15:00 – 17:00"];
    }

    const highCount = generated.filter((g) => g.level === "high").length;

    let insightText = "";

    if (signalText.includes("PEAK")) {
      insightText =
        `Aura Core™ indicates strong favourable alignment today. ${relation.label} conditions may improve your overall timing.`;
    } else if (signalText.includes("STABLE")) {
      insightText =
        `Aura Core™ shows balanced conditions today. ${relation.label} influence suggests a more measured approach.`;
    } else {
      insightText =
        `Aura Core™ detects weaker conditions today. ${relation.label} influence suggests extra caution.`;
    }

    insightText += ` ${highCount} high probability numbers detected in this batch.`;

    setResults(generated.slice(0, isPro ? 10 : 5));
    setSignal(signalText);
    setInsight(insightText);
    setAuraScore(score);
    setTodayElement(realTodayElement);
    setDayRelation(relation.label);
    setLuckyHours(hours);

    setTimeout(() => {
      if (!isPro) {
        setInsight("Try another batch to refine your alignment today.");
      }
    }, 3000);

    if (!isPro) {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem("usageCount", newCount.toString());
      localStorage.setItem("usageDate", todayKey);
    }
  }

async function calculateDayMaster() {
    if (!birthDate) {
      setCalculatedResult("Please enter your birth date first.");
      return;
    }

    if (!birthTime) {
      setCalculatedResult("Please enter your birth time.");
      return;
    }

    if (!city.trim()) {
      setCalculatedResult("Please enter your city of birth.");
      return;
    }

    try {
      setIsCalculating(true);
      setCalculatedResult("");

      const [year, month, day] = birthDate.split("-").map(Number);
      const [hour, minute] = birthTime.split(":").map(Number);

      const response = await fetch("/api/bazi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          year,
          month,
          day,
          hour,
          minute,
          city: city.trim(),
          sex,
          time_standard: "civil"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to calculate Day Master");
      }

      const element = data?.day_master?.info?.element?.toLowerCase();
      const polarity = data?.day_master?.info?.polarity;
      const stem = data?.day_master?.stem;

      if (!element) {
        throw new Error("Day Master not found in response.");
      }

      setDayMaster(element);
      localStorage.setItem("dayMaster", element);

      setCalculatedResult(
        `Your Day Master is ${polarity} ${element.charAt(0).toUpperCase() + element.slice(1)} (${stem}). Your number generation will now use this profile automatically.`
      );
      setMode("manual");
    } catch (error) {
      setCalculatedResult(
        "Unable to calculate Day Master right now. Please check your inputs and API setup."
      );
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  }

  function getLevelLabel(level) {
    if (level === "high") return "🔥 Peak Alignment";
    if (level === "medium") return "⚖️ Stable Alignment";
    return "🌑 Weak Alignment";
  }

  function getRankLabel(index) {
    if (index < 2) return "⭐ Top Pick";
    if (index < 4) return "✨ Secondary";
    return "🪶 Backup";
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unlockKey = params.get("unlock");

    if (unlockKey === "pro123") {
      localStorage.setItem("isPro", "true");
      setIsPro(true);
    }
  }, []);

  function getSupportElement(dayMaster) {
    if (dayMaster === "wood") return "water";
    if (dayMaster === "fire") return "wood";
    if (dayMaster === "earth") return "fire";
    if (dayMaster === "metal") return "earth";
    return "metal"; // water
  }

  function getWealthElement(dayMaster) {
    if (dayMaster === "wood") return "earth";
    if (dayMaster === "fire") return "metal";
    if (dayMaster === "earth") return "water";
    if (dayMaster === "metal") return "wood";
    return "fire"; // water
  }

  function getOutputElement(dayMaster) {
    if (dayMaster === "wood") return "fire";
    if (dayMaster === "fire") return "earth";
    if (dayMaster === "earth") return "metal";
    if (dayMaster === "metal") return "water";
    return "wood"; // water
  }

  function getDayRelation(dayMaster, todayElement) {
    if (todayElement === dayMaster) {
      return {
        type: "companion",
        label: "Neutral Day",
        bonus: 0
      };
    }

    if (todayElement === getSupportElement(dayMaster)) {
      return {
        type: "support",
        label: "Support Day",
        bonus: 20
      };
    }

    if (todayElement === getWealthElement(dayMaster)) {
      return {
        type: "wealth",
        label: "Opportunity Day",
        bonus: 20
      };
    }

    if (todayElement === getOutputElement(dayMaster)) {
      return {
        type: "output",
        label: "Active Day",
        bonus: 10
      };
    }

    return {
      type: "pressure",
      label: "Pressure Day",
      bonus: -20
    };
  }

  function getChineseDayElement() {
    const now = new Date();

    const solar = Solar.fromYmdHms(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const lunar = solar.getLunar();

    // Day GanZhi, e.g. 甲子 / 丙午 / 辛酉
    const dayGan = lunar.getDayGan();

    if (["甲", "乙"].includes(dayGan)) return "wood";
    if (["丙", "丁"].includes(dayGan)) return "fire";
    if (["戊", "己"].includes(dayGan)) return "earth";
    if (["庚", "辛"].includes(dayGan)) return "metal";
    return "water"; // 壬, 癸
  }

  function getNumberRating(
    num,
    level,
    wealthDigits,
    supportDigits,
    relation,
    todayElement
  ) {
    let base = 40;

    if (level === "high") base = 78;
    else if (level === "medium") base = 58;
    else base = 35;

    let wealthBonus = 0;
    let supportBonus = 0;
    let repeatBonus = 0;
    let relationBonus = 0;
    let resonanceBonus = 0;

    const digits = num.split("");
    const resonanceDigits = getElementResonanceDigits(todayElement);

    digits.forEach((d) => {
      if (wealthDigits.includes(d)) wealthBonus += 4;
      if (supportDigits.includes(d)) supportBonus += 2;
      if (resonanceDigits.includes(d)) resonanceBonus += 2;
    });

    const uniqueCount = new Set(digits).size;
    if (uniqueCount <= 3) repeatBonus += 4;
    if (digits[0] === digits[1] || digits[2] === digits[3]) repeatBonus += 3;

    if (relation.type === "support") relationBonus = 6;
    else if (relation.type === "wealth") relationBonus = 6;
    else if (relation.type === "output") relationBonus = 3;
    else if (relation.type === "pressure") relationBonus = -6;

    const randomBonus = Math.floor(Math.random() * 6);

    let rating =
      base +
      wealthBonus +
      supportBonus +
      repeatBonus +
      relationBonus +
      resonanceBonus +
      randomBonus;

    if (rating > 99) rating = 99;
    if (rating < 1) rating = 1;

    return rating;
  }

  function getElementResonanceDigits(element) {
    if (element === "water") return ["1"];
    if (element === "wood") return ["3", "4"];
    if (element === "fire") return ["9"];
    if (element === "earth") return ["2", "5", "8"];
    if (element === "metal") return ["6", "7"];
    return [];
  }

  function getPersonalPowerDigits(dayMaster) {
    const wealthDigits = getWealthDigits(dayMaster);
    const supportDigits = getSupportDigits(dayMaster);

    // combine and remove duplicates
    return [...new Set([...wealthDigits, ...supportDigits])];
  }

  useEffect(() => {
    const currentTodayKey = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("usageDate");

    if (savedDate !== currentTodayKey) {
      localStorage.setItem("usageDate", currentTodayKey);
      localStorage.setItem("usageCount", "0");
      setUsageCount(0);
    }
  }, []);

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
            AURA FORTUNE SYSTEM
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

        <div
          style={{
            background: "#141414",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "15px",
            border: "1px solid #222",
            display: "block"
          }}>

            <div
              style={{
                fontSize: "12px",
                color: "#c9a227",
                marginBottom: "4px",
                letterSpacing: "0.5px"
              }}
            >
              PLAN
            </div>

            <div style={{ fontSize: "15px", fontWeight: "bold" }}>
              {isPro ? "PRO Access" : "Free Plan"}
            </div>

            <div style={{
              fontSize: "11px",
              color: "#aaa",
              marginTop: "4px"
            }}>
              {isPro
                ? "Unlimited access unlocked"
                : "Upgrade to unlock full features"}
            </div>
        </div>

        <div style={{
            marginBottom: "12px",
            fontSize: "12px",
            color: "#aaa"
          }}>
            {isPro
              ? "Unlimited access enabled"
              : `Free uses left: ${Math.max(0, 3 - usageCount)}`}
          </div>

          <div style={{
            background: "#141414",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "15px"
          }}>
          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            Choose Mode
          </div>

          <button
            onClick={() => setMode("manual")}
            style={{
              width: "48%",
              marginRight: "4%",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: mode === "manual" ? "gold" : "#333",
              color: mode === "manual" ? "#111" : "white",
              fontWeight: "bold"
            }}
          >
            I Know My Day Master
          </button>

          <button
            onClick={() => setMode("finder")}
            style={{
              width: "48%",
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: mode === "finder" ? "gold" : "#333",
              color: mode === "finder" ? "#111" : "white",
              fontWeight: "bold"
            }}
          >
            Find My Day Master
          </button>
        </div>

      {mode === "manual" && (
          <div>
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
          </div>
        )}

        {mode === "finder" && (
              <div style={{
                background: "#141414",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "15px"
              }}>
                <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
                  Find My Day Master
                </div>

                <label>Date of Birth</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                    background: "#1a1a1a",
                    color: "white",
                    boxSizing: "border-box"
                  }}
                />

                <label>Time of Birth</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                    background: "#1a1a1a",
                    color: "white",
                    boxSizing: "border-box"
                  }}
                />

                <label>City of Birth</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kuala Lumpur"
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                    background: "#1a1a1a",
                    color: "white",
                    boxSizing: "border-box"
                  }}
                />

                <label>Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginTop: "8px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                    background: "#1a1a1a",
                    color: "white",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>

                <button
                  onClick={calculateDayMaster}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "gold",
                    color: "#111",
                    fontWeight: "bold"
                  }}
                >
                  {isCalculating ? "Calculating..." : "Calculate My Day Master"}
                </button>
              </div>
        )}

        <div
          style={{
            background: "#141414",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "15px",
            border: "1px solid #222"
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#c9a227",
              marginBottom: "6px",
              letterSpacing: "0.5px"
            }}
          >
            ACTIVE PROFILE
          </div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            {dayMaster.charAt(0).toUpperCase() + dayMaster.slice(1)} Day Master
          </div>
        </div>

        {calculatedResult && (
          <div
            style={{
              marginTop: "12px",
              padding: "14px",
              background: "#1d1d1d",
              borderRadius: "12px",
              fontSize: "14px",
              lineHeight: "1.6",
              border: "1px solid rgba(201,162,39,0.25)"
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#c9a227",
                marginBottom: "6px",
                letterSpacing: "0.5px"
              }}
            >
              PROFILE RESULT
            </div>
            {calculatedResult}
          </div>
        )}

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
            signal.includes("PEAK") ? "#123d2b" :
            signal.includes("STABLE") ? "#5a4310" :
            "#4a1f26",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>

          <div style={{
            fontSize: "11px",
            color: "#c9a227",
            marginBottom: "4px",
            letterSpacing: "0.5px"
          }}>
            AURA CORE™
          </div>

          <div style={{
            fontSize: "11px",
            opacity: 0.7,
            marginBottom: "6px"
          }}>
            TODAY'S SIGNAL
          </div>

          <div style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "4px"
          }}>
            Energy shifts daily
          </div>

          <div style={{
            fontSize: "20px",
            fontWeight: "bold"
          }}>
            {signal.includes("PEAK")
              ? "🔥 Peak Alignment Day 🔥"
              : signal.includes("STABLE")
              ? "⚖️ Stable Flow Day ⚖️"
              : "🌑 Weak Alignment Day 🌑"}
          </div>

          {auraScore !== null && (
            <div style={{
              marginTop: "10px",
              fontSize: "22px",
              fontWeight: "bold",
              color: "#f3d36b"
            }}>
              {auraScore} / 100
            </div>
          )}

          <div style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "4px"
          }}>
            Aura Core™ Score
          </div>

          {todayElement && (
            <div style={{
              fontSize: "12px",
              opacity: 0.8,
              marginTop: "10px",
              lineHeight: "1.6"
            }}>
              Today's Element: {todayElement.charAt(0).toUpperCase() + todayElement.slice(1)}
              <br />
              Relationship: {dayRelation}
            </div>
          )}

          <div style={{
            fontSize: "11px",
            opacity: 0.7,
            marginTop: "6px"
          }}>
            Resonance Digits: {getElementResonanceDigits(todayElement).join(", ")}
          </div>

          <div style={{
            fontSize: "11px",
            opacity: 0.7,
            marginTop: "6px"
          }}>
            Power Digits: {getPersonalPowerDigits(dayMaster).join(", ")}
          </div>

          {luckyHours.length > 0 && (
            <div style={{
              marginTop: "14px",
              padding: "12px",
              background: "#1a1a1a",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <div style={{
                fontSize: "11px",
                opacity: 0.7,
                marginBottom: "6px"
              }}>
                ⏰ LUCKY WINDOWS
              </div>

              {luckyHours.map((h, i) => (
                <div key={i} style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginTop: "2px"
                }}>
                  {h}
                </div>
              ))}
            </div>
          )}

          <div style={{
            fontSize: "11px",
            opacity: 0.6,
            marginTop: "6px"
          }}>
            Indicates today's alignment strength based on your profile
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
          {insight || "Today's energy is forming. Generate your numbers to align with the strongest timing."}
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
                  ? "linear-gradient(135deg, #1f5c3f, #123d2b)"
                  : r.level === "medium"
                  ? "#5a4310"
                  : "#4a1f26",

              boxShadow:
                r.level === "high"
                  ? "0 0 15px rgba(46, 204, 113, 0.4)"
                  : "none",

              border:
                r.level === "high"
                  ? "1px solid rgba(46, 204, 113, 0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
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
                  opacity: 0.8,
                  marginTop: "3px"
                }}>
                  Aligned with today's strongest energy
                </div>

                <div style={{
                  fontSize: "11px",
                  color: "#f3d36b",
                  marginTop: "4px",
                  fontWeight: "bold"
                }}>
                  Rating: {r.rating}/100
                </div>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "6px"
              }}>
                <div style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.1)"
                }}>
                  {getLevelLabel(r.level)}
                </div>

                <div style={{
                  fontSize: "11px",
                  opacity: 0.85
                }}>
                  {getRankLabel(i)}
                </div>
              </div>
           </div>
          ))}

          <div
            style={{
              marginTop: "18px",
              padding: "16px",
              background: "#141414",
              borderRadius: "16px",
              border: "1px solid #222"
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "8px"
              }}
            >
              {isPro ? "🔓 PRO Analysis" : "🔒 PRO Analysis"}
            </div>

            {isPro ? (
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#d0d0d0"
                }}
              >
                Stronger-day analysis enabled. Extended batch output, deeper profile usage,
                and premium guidance are active in this mode.
              </div>
            ) : (
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#d0d0d0"
                }}
              >
                Unlock PRO for more numbers, deeper analysis, and premium insights based on
                your detected profile.
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "18px",
              padding: "16px",
              background: "#141414",
              borderRadius: "16px",
              border: "1px solid #222",
              textAlign: "center"
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "8px"
              }}
            >
              🔒 Upgrade to PRO
            </div>

            <div
              style={{
                fontSize: "13px",
                lineHeight: "1.6",
                color: "#cfcfcf",
                marginBottom: "12px"
              }}
            >
              Unlock more numbers, stronger-day guidance, premium signal interpretation,
              and deeper profile-based analysis.
            </div>

            <button
              onClick={() => setShowPricing(true)}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #f3d36b, #c9a227)",
                color: "#111",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              View Pricing
            </button>
          </div>

          {showPricing && (
            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                background: "#141414",
                borderRadius: "16px",
                border: "1px solid #222"
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "14px",
                  textAlign: "center"
                }}
              >
                🔥 Unlock Your Full Fortune Access
              </div>

              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#1d1d1d",
                  marginBottom: "12px",
                  border: "1px solid #2a2a2a"
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Free
                </div>
                <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#d0d0d0" }}>
                  • Limited daily access (3 uses)<br />
                  • Standard number suggestions (5 picks)<br />
                  • Basic signal reading
                </div>
              </div>

              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#221b0d",
                  marginBottom: "12px",
                  border: "1px solid rgba(201,162,39,0.35)"
                }}
              >
                {/* PRICE */}
                <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#f3d36b" }}>
                  PRO — <span style={{ textDecoration: "line-through", opacity: 0.6 }}>RM18</span> RM8 / month
                </div>

                {/* INTRO LABEL */}
                <div style={{
                  fontSize: "11px",
                  color: "#c9a227",
                  marginTop: "4px"
                }}>
                  🎉 Intro Offer (Limited Time)
                </div>

                <div style={{
                  fontSize: "11px",
                  color: "#f3d36b",
                  marginTop: "6px"
                }}>
                  ⚡ Most users upgrade after hitting their limit
                </div>

                {/* FEATURES */}
                <div style={{ fontSize: "13px", lineHeight: "1.7", color: "#f3f3f3" }}>
                  • Unlimited daily generation<br />
                  • Expanded number combinations (10 picks)<br />
                  • Strong-day priority filtering<br />
                  • Advanced BaZi profile alignment<br />
                  • Enhanced signal accuracy system
                </div>

                <div style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#c9a227"
                }}>
                  ✨ Designed for serious players only
                </div>

                <div style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#f3d36b"
                }}>
                  🔥 Locked in at RM8 for early users
                </div>

                {/* SCARCITY LINE */}
                <div style={{
                  fontSize: "11px",
                  color: "#aaa",
                  marginTop: "6px"
                }}>
                  Early access pricing. Will revert to RM18 soon.
                </div>
              </div>

              <button
                onClick={() => window.open("https://wa.me/60129989149?text=Hi%20I%20want%20to%20unlock%20Aura%20Luck%20PRO%20(RM8%20intro%20offer)", "_blank")}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #f3d36b, #c9a227)",
                  color: "#111",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "10px"
                }}
              >
                Upgrade Now
              </button>

              <button
                onClick={() => setShowPricing(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #333",
                  background: "#1a1a1a",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          )}
      </div>
    </div>
  );
}