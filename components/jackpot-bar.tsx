"use client"

import { useState, useEffect, useRef } from "react"

// Jackpot değerleri (sahte, animasyonlu artış)
const JACKPOT_BASE = {
  major: 199_400.00,
  mega: 289_860.00,
  minor: 18_780.00,
}

function useAnimatedValue(base: number, speed: number) {
  const [value, setValue] = useState(base)
  const ref = useRef(base)
  useEffect(() => {
    const id = setInterval(() => {
      ref.current += speed * (0.5 + Math.random())
      setValue(parseFloat(ref.current.toFixed(2)))
    }, 80)
    return () => clearInterval(id)
  }, [speed])
  return value
}

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ---------- Desktop Jackpot Bar ----------
export function DesktopJackpotBar() {
  const [expanded, setExpanded] = useState(false)
  const major = useAnimatedValue(JACKPOT_BASE.major, 0.18)
  const mega  = useAnimatedValue(JACKPOT_BASE.mega,  0.28)
  const minor = useAnimatedValue(JACKPOT_BASE.minor, 0.08)

  return (
    <div style={{ width: "100%", backgroundColor: "#131313", flexShrink: 0 }}>
      {/* Collapsed bar — her zaman görünür */}
      <div
        style={{
          width: "100%",
          height: 113,
          display: "flex",
          alignItems: "center",
          gap: 11,
          position: "relative",
          padding: "0 11px",
          boxSizing: "border-box",
        }}
      >
        {/* MAJOR */}
        <div style={{
          flex: 1,
          height: 60,
          minWidth: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 10,
          padding: "0 20px",
          backgroundColor: "#3b3b3b",
          overflow: "hidden",
          borderRadius: 8,
        }}>
          <img src="/icons/major.svg" alt="major" width={32} height={32} style={{ flexShrink: 0 }} />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 20, letterSpacing: 1, whiteSpace: "nowrap", flexShrink: 0 }}>MAJOR</span>
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 22, marginLeft: 8, letterSpacing: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}>{fmt(major)}</span>
        </div>

        {/* MEGA */}
        <div style={{
          flex: 1,
          height: 60,
          minWidth: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 10,
          padding: "0 20px",
          background: "linear-gradient(90deg, #8b2020 0%, #c0392b 50%, #8b2020 100%)",
          overflow: "hidden",
          borderRadius: 8,
        }}>
          <img src="/icons/mega.svg" alt="mega" width={32} height={32} style={{ flexShrink: 0 }} />
          <span style={{ color: "#131313", fontWeight: 700, fontSize: 20, letterSpacing: 1, whiteSpace: "nowrap", flexShrink: 0 }}>MEGA</span>
          <span style={{ color: "#ffcf26", fontWeight: 700, fontSize: 22, marginLeft: 8, letterSpacing: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}>{fmt(mega)}</span>
        </div>

        {/* MINOR */}
        <div style={{
          flex: 1,
          height: 60,
          minWidth: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 10,
          padding: "0 20px",
          backgroundColor: "#3b3b3b",
          overflow: "hidden",
          borderRadius: 8,
        }}>
          <img src="/icons/minor.svg" alt="minor" width={32} height={32} style={{ flexShrink: 0 }} />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 20, letterSpacing: 1, whiteSpace: "nowrap", flexShrink: 0 }}>MİNOR</span>
          <span style={{ color: "#fdac55", fontWeight: 700, fontSize: 22, marginLeft: 8, letterSpacing: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}>{fmt(minor)}</span>
        </div>

        {/* Sağda 2 buton üst üste: yukarı ok + aşağı ok */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 51,
          flexShrink: 0,
          gap: 4,
        }}>
          {/* Yukarı ok — paneli açar, SVG 180° döndürülmüş */}
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: "#3a3d45",
              border: "none",
              cursor: "pointer",
              width: 51,
              height: 51,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              flexShrink: 0,
            }}
            aria-label="Detayları aç"
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg)" }}>
              <path d="M8.00001 4.69317L13.7867 0.559839C14.1422 0.31095 14.5109 0.280017 14.8928 0.467039C15.2747 0.654061 15.466 0.969439 15.4667 1.41317C15.4667 1.59095 15.4265 1.75984 15.3461 1.91984C15.2658 2.07984 15.1549 2.20428 15.0133 2.29317L8.00001 7.3065L0.986675 2.29317C0.844453 2.20428 0.733164 2.07984 0.652808 1.91984C0.572452 1.75984 0.532631 1.59095 0.533342 1.41317C0.533342 0.986505 0.724277 0.675394 1.10614 0.479838C1.48801 0.284283 1.85708 0.31095 2.21334 0.559839L8.00001 4.69317ZM8.00001 11.0398L13.7867 6.90651C14.1422 6.65762 14.5109 6.62633 14.8928 6.81264C15.2747 6.99895 15.466 7.31504 15.4667 7.7609C15.4667 7.93868 15.4265 8.10757 15.3461 8.26757C15.2658 8.42757 15.1549 8.55202 15.0133 8.64091L8.00001 13.6532L0.986675 8.63984C0.844452 8.55095 0.733163 8.4265 0.652808 8.2665C0.572452 8.1065 0.532631 7.93762 0.533342 7.75984C0.533342 7.33317 0.724276 7.02206 1.10614 6.82651C1.48801 6.63095 1.85708 6.65762 2.21334 6.90651L8.00001 11.0398Z" fill="#DBDBDB"/>
            </svg>
          </button>
          {/* Aşağı ok — paneli kapatır */}
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "#3a3d45",
              border: "none",
              cursor: "pointer",
              width: 51,
              height: 51,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              flexShrink: 0,
            }}
            aria-label="Detayları kapat"
          >
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.00001 4.69317L13.7867 0.559839C14.1422 0.31095 14.5109 0.280017 14.8928 0.467039C15.2747 0.654061 15.466 0.969439 15.4667 1.41317C15.4667 1.59095 15.4265 1.75984 15.3461 1.91984C15.2658 2.07984 15.1549 2.20428 15.0133 2.29317L8.00001 7.3065L0.986675 2.29317C0.844453 2.20428 0.733164 2.07984 0.652808 1.91984C0.572452 1.75984 0.532631 1.59095 0.533342 1.41317C0.533342 0.986505 0.724277 0.675394 1.10614 0.479838C1.48801 0.284283 1.85708 0.31095 2.21334 0.559839L8.00001 4.69317ZM8.00001 11.0398L13.7867 6.90651C14.1422 6.65762 14.5109 6.62633 14.8928 6.81264C15.2747 6.99895 15.466 7.31504 15.4667 7.7609C15.4667 7.93868 15.4265 8.10757 15.3461 8.26757C15.2658 8.42757 15.1549 8.55202 15.0133 8.64091L8.00001 13.6532L0.986675 8.63984C0.844452 8.55095 0.733163 8.4265 0.652808 8.2665C0.572452 8.1065 0.532631 7.93762 0.533342 7.75984C0.533342 7.33317 0.724276 7.02206 1.10614 6.82651C1.48801 6.63095 1.85708 6.65762 2.21334 6.90651L8.00001 11.0398Z" fill="#DBDBDB"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded panel — ikramiyeler detayı */}
      {expanded && (
        <div style={{
          backgroundColor: "#131313",
          padding: "20px 24px",
          borderTop: "1px solid #333",
        }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>İkramiyeler</p>
          <div style={{ display: "flex", gap: 12 }}>
            {/* MAJOR card */}
            <div style={{
              flex: 1,
              backgroundColor: "#3b3b3b",
              borderRadius: 6,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0 }}>MAJOR</p>
                  <p style={{ color: "#e0b96e", fontWeight: 700, fontSize: 22, margin: "4px 0 0 0" }}>{fmt(major)}</p>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "#aaa" }}>
                  <p style={{ margin: 0 }}>Katkısı: <b style={{ color: "#fff" }}>1%</b></p>
                  <p style={{ margin: "4px 0 0 0" }}>Tür: <b style={{ color: "#fff" }}>Progressive</b></p>
                </div>
              </div>
            </div>
            {/* MEGA card */}
            <div style={{
              flex: 1,
              background: "linear-gradient(135deg, #8b2020 0%, #c0392b 100%)",
              borderRadius: 6,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0 }}>MEGA</p>
                  <p style={{ color: "#f5c842", fontWeight: 700, fontSize: 22, margin: "4px 0 0 0" }}>{fmt(mega)}</p>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  <p style={{ margin: 0 }}>Katkısı: <b style={{ color: "#fff" }}>0.5%</b></p>
                  <p style={{ margin: "4px 0 0 0" }}>Tür: <b style={{ color: "#fff" }}>Progressive</b></p>
                </div>
              </div>
            </div>
          </div>
          {/* MINOR card */}
          <div style={{
            backgroundColor: "#3b3b3b",
            borderRadius: 6,
            padding: "14px 16px",
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0 }}>MİNOR</p>
              <p style={{ color: "#e0b96e", fontWeight: 700, fontSize: 22, margin: "4px 0 0 0" }}>{fmt(minor)}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "#aaa" }}>
              <p style={{ margin: 0 }}>Katkısı: <b style={{ color: "#fff" }}>0.5%</b></p>
              <p style={{ margin: "4px 0 0 0" }}>Tür: <b style={{ color: "#fff" }}>Progressive</b></p>
            </div>
          </div>
          {/* Onay metni + buton */}
          <p style={{ color: "#aaa", fontSize: 13, margin: "16px 0" }}>
            Onaylayarak, jackpot kurallarını kabul etmiş olursunuz ve koyduğunuz her bahisten sonra ek katkının jackpot&apos;a aktarılacağını kabul edersiniz.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "12px 40px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}>
              Hepsine Katılın
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Mobile Jackpot Bar ----------
export function MobileJackpotBar() {
  const [expanded, setExpanded] = useState(false)
  const major = useAnimatedValue(JACKPOT_BASE.major, 0.18)
  const mega  = useAnimatedValue(JACKPOT_BASE.mega,  0.28)
  const minor = useAnimatedValue(JACKPOT_BASE.minor, 0.08)

  return (
    <div style={{ width: "100%", backgroundColor: "#131313", flexShrink: 0 }}>
      {/* Collapsed bar */}
      <div style={{ display: "flex", gap: 4, padding: "6px 6px", position: "relative" }}>
        {/* MAJOR */}
        <div style={{
          flex: 1,
          backgroundColor: "#3b3b3b",
          borderRadius: 6,
          padding: "0 12px",
          height: 80,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 8,
          overflow: "hidden",
        }}>
          <img src="/icons/major.svg" alt="major" width={28} height={28} style={{ flexShrink: 0 }} />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 20, whiteSpace: "nowrap", flexShrink: 0 }}>MAJOR</span>
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 22, whiteSpace: "nowrap", flexShrink: 0 }}>{fmt(major)}</span>
        </div>

        {/* MEGA */}
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #8b2020 0%, #c0392b 100%)",
          borderRadius: 6,
          padding: "0 12px",
          height: 80,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 8,
          overflow: "hidden",
        }}>
          <img src="/icons/mega.svg" alt="mega" width={28} height={28} style={{ flexShrink: 0 }} />
          <span style={{ color: "#131313", fontWeight: 700, fontSize: 20, whiteSpace: "nowrap", flexShrink: 0 }}>MEGA</span>
          <span style={{ color: "#ffcf26", fontWeight: 700, fontSize: 22, whiteSpace: "nowrap", flexShrink: 0 }}>{fmt(mega)}</span>
        </div>

        {/* MINOR */}
        <div style={{
          flex: 1,
          backgroundColor: "#3b3b3b",
          borderRadius: 6,
          padding: "0 12px",
          height: 80,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: 8,
          overflow: "hidden",
        }}>
          <img src="/icons/minor.svg" alt="minor" width={28} height={28} style={{ flexShrink: 0 }} />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 20, whiteSpace: "nowrap", flexShrink: 0 }}>MİNOR</span>
          <span style={{ color: "#fdac55", fontWeight: 700, fontSize: 22, whiteSpace: "nowrap", flexShrink: 0 }}>{fmt(minor)}</span>
        </div>

        {/* Toggle buttons sağ üst */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignSelf: "stretch",
          justifyContent: "center",
        }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#2e3340",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={expanded ? "Küçült" : "Büyüt"}
          >
            {expanded ? (
              // Aşağı ok (küçült)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            ) : (
              // Yukarı ok (büyüt)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ padding: "12px 10px 16px", borderTop: "1px solid #333" }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>İkramiyeler</p>
          {/* MAJOR */}
          <div style={{ backgroundColor: "#252a31", borderRadius: 6, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>MAJOR</p>
              <p style={{ color: "#e0b96e", fontWeight: 700, fontSize: 22, margin: "4px 0 0 0" }}>{fmt(major)}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#aaa" }}>
              <p style={{ margin: 0 }}>Katkısı: <b style={{ color: "#fff" }}>1%</b></p>
              <p style={{ margin: "4px 0 0 0" }}>Tür: <b style={{ color: "#fff" }}>Progressive</b></p>
            </div>
          </div>
          {/* MEGA */}
          <div style={{ background: "linear-gradient(135deg, #8b2020 0%, #c0392b 100%)", borderRadius: 6, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>MEGA</p>
              <p style={{ color: "#f5c842", fontWeight: 700, fontSize: 22, margin: "4px 0 0 0" }}>{fmt(mega)}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
              <p style={{ margin: 0 }}>Katkısı: <b style={{ color: "#fff" }}>0.5%</b></p>
              <p style={{ margin: "4px 0 0 0" }}>Tür: <b style={{ color: "#fff" }}>Progressive</b></p>
            </div>
          </div>
          {/* MINOR */}
          <div style={{ backgroundColor: "#252a31", borderRadius: 6, padding: "12px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>MİNOR</p>
              <p style={{ color: "#e0b96e", fontWeight: 700, fontSize: 22, margin: "4px 0 0 0" }}>{fmt(minor)}</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#aaa" }}>
              <p style={{ margin: 0 }}>Katkısı: <b style={{ color: "#fff" }}>0.5%</b></p>
              <p style={{ margin: "4px 0 0 0" }}>Tür: <b style={{ color: "#fff" }}>Progressive</b></p>
            </div>
          </div>
          <p style={{ color: "#aaa", fontSize: 12, margin: "0 0 12px 0" }}>
            Onaylayarak, jackpot kurallarını kabul etmiş olursunuz ve koyduğunuz her bahisten sonra ek katkının jackpot&apos;a aktarılacağını kabul edersiniz.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "10px 32px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              width: "60%",
            }}>
              Hepsine Katılın
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
